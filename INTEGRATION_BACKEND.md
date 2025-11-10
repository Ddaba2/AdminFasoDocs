# 🔌 Guide d'Intégration Backend - FasoDocs Admin

## 📋 Table des Matières

1. [Architecture Globale](#architecture-globale)
2. [Configuration Backend Requise](#configuration-backend-requise)
3. [Endpoints API](#endpoints-api)
4. [Authentification JWT](#authentification-jwt)
5. [Format des Données](#format-des-données)
6. [Gestion des Erreurs](#gestion-des-erreurs)
7. [CORS Configuration](#cors-configuration)
8. [Exemples de Requêtes](#exemples-de-requêtes)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Globale

### Vue d'Ensemble

L'application FasoDocs Admin communique avec un backend Spring Boot via une API REST. Toutes les communications utilisent le protocole HTTP/HTTPS et le format JSON.

```
┌─────────────────────────────────────────┐
│         Angular Frontend                │
│         (Port 4200)                     │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │        ApiService                │  │
│  │  - Gère toutes les requêtes HTTP│  │
│  │  - Ajoute le token JWT          │  │
│  │  - Gère les headers             │  │
│  └────────────┬─────────────────────┘  │
└───────────────┼─────────────────────────┘
                │
                │ HTTP/JSON
                │ Authorization: Bearer {token}
                │
                ▼
┌─────────────────────────────────────────┐
│      Spring Boot Backend                │
│      (Port 8080)                        │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   REST Controllers               │  │
│  │   - AuthController               │  │
│  │   - AdminController              │  │
│  │   - CentreController             │  │
│  └────────────┬─────────────────────┘  │
│               │                         │
│  ┌────────────▼─────────────────────┐  │
│  │   Spring Security                │  │
│  │   - Validation JWT               │  │
│  │   - Vérification des rôles       │  │
│  └────────────┬─────────────────────┘  │
│               │                         │
│  ┌────────────▼─────────────────────┐  │
│  │   Services + Repositories        │  │
│  └────────────┬─────────────────────┘  │
│               │                         │
│  ┌────────────▼─────────────────────┐  │
│  │        Base de Données           │  │
│  │        (MySQL/PostgreSQL)        │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### URL de Base

```typescript
const API_URL = 'http://localhost:8080/api';
```

**En production**, cette URL devra pointer vers:
```
https://votre-domaine.com/api
```

---

## ⚙️ Configuration Backend Requise

### 1. CORS Configuration (Spring Boot)

Le backend doit accepter les requêtes Cross-Origin depuis le frontend Angular.

**Fichier: `CorsConfig.java`**

```java
package com.fasodocs.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Autoriser les requêtes depuis le frontend Angular
        config.addAllowedOrigin("http://localhost:4200");  // Développement
        config.addAllowedOrigin("https://admin.fasodocs.com"); // Production
        
        // Autoriser tous les headers
        config.addAllowedHeader("*");
        
        // Autoriser toutes les méthodes HTTP
        config.addAllowedMethod("*");
        
        // Autoriser les credentials (cookies, authorization headers)
        config.setAllowCredentials(true);
        
        // Appliquer la configuration à tous les endpoints /api/**
        source.registerCorsConfiguration("/api/**", config);
        
        return new CorsFilter(source);
    }
}
```

### 2. Spring Security Configuration

**Fichier: `SecurityConfig.java`**

```java
package com.fasodocs.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthFilter;
    
    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors() // Active la configuration CORS
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests()
                // Endpoints publics (authentification)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/centres").permitAll()
                .requestMatchers("/api/couts").permitAll()
                // Endpoints admin (nécessitent authentification + rôle ADMIN)
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Toutes les autres requêtes nécessitent une authentification
                .anyRequest().authenticated()
            .and()
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### 3. JWT Filter

**Fichier: `JwtAuthenticationFilter.java`**

```java
package com.fasodocs.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    
    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        // Extraire le header Authorization
        final String authHeader = request.getHeader("Authorization");
        
        // Vérifier le format: "Bearer {token}"
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Extraire le token JWT
        final String jwt = authHeader.substring(7);
        final String userPhone = jwtService.extractUsername(jwt);
        
        // Si le token est valide et l'utilisateur n'est pas déjà authentifié
        if (userPhone != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userPhone);
            
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

---

## 🔐 Authentification JWT

### Flux d'Authentification Complet

#### Étape 1: Envoi du Code SMS

**Frontend → Backend**

```typescript
// Angular (api.service.ts)
sendSmsCode(phoneNumber: string): Observable<any> {
  const request = { telephone: phoneNumber };
  return this.http.post(`${API_URL}/api/auth/connexion-telephone`, request);
}
```

**Backend Controller**

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/connexion-telephone")
    public ResponseEntity<?> sendSmsCode(@RequestBody PhoneLoginRequest request) {
        // Valider le numéro de téléphone
        if (!isValidPhoneNumber(request.getTelephone())) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("Numéro de téléphone invalide")
            );
        }
        
        // Générer un code à 4 chiffres
        String code = generateSmsCode();
        
        // Sauvegarder le code (Redis/Database avec expiration)
        smsCodeService.saveCode(request.getTelephone(), code);
        
        // Envoyer le SMS
        smsService.sendSms(request.getTelephone(), "Votre code FasoDocs: " + code);
        
        return ResponseEntity.ok(new MessageResponse("Code SMS envoyé"));
    }
}
```

**Requête HTTP**
```http
POST http://localhost:8080/api/auth/connexion-telephone
Content-Type: application/json

{
  "telephone": "+22670123456"
}
```

**Réponse Attendue**
```json
{
  "message": "Code SMS envoyé",
  "status": "success"
}
```

#### Étape 2: Vérification du Code SMS

**Frontend → Backend**

```typescript
// Angular (api.service.ts)
verifySmsCode(phoneNumber: string, code: string): Observable<any> {
  const request = { telephone: phoneNumber, code: code };
  return this.http.post(`${API_URL}/api/auth/verifier-sms`, request);
}
```

**Backend Controller**

```java
@PostMapping("/verifier-sms")
public ResponseEntity<?> verifySmsCode(@RequestBody SmsVerificationRequest request) {
    // Vérifier le code
    if (!smsCodeService.verifyCode(request.getTelephone(), request.getCode())) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
            new ErrorResponse("Code invalide ou expiré")
        );
    }
    
    // Récupérer l'utilisateur
    Utilisateur user = utilisateurService.findByTelephone(request.getTelephone());
    
    if (user == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            new ErrorResponse("Utilisateur non trouvé")
        );
    }
    
    // Vérifier que l'utilisateur a le rôle ADMIN
    if (!user.getRole().equals("ADMIN")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
            new ErrorResponse("Accès refusé: droits administrateur requis")
        );
    }
    
    // Générer le token JWT
    String token = jwtService.generateToken(user);
    
    // Retourner la réponse avec le token
    return ResponseEntity.ok(new AuthResponse(
        token,
        user.getId(),
        user.getNom(),
        user.getPrenom(),
        user.getTelephone(),
        user.getRole()
    ));
}
```

**Requête HTTP**
```http
POST http://localhost:8080/api/auth/verifier-sms
Content-Type: application/json

{
  "telephone": "+22670123456",
  "code": "1234"
}
```

**Réponse Attendue**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "nom": "TRAORE",
  "prenom": "Abdoulaye",
  "telephone": "+22670123456",
  "role": "ADMIN"
}
```

#### Étape 3: Utilisation du Token

Une fois le token reçu, le frontend l'envoie dans toutes les requêtes suivantes:

```typescript
// Angular (api.service.ts)
private getHeaders(): HttpHeaders {
  let headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });
  
  if (this.token) {
    headers = headers.set('Authorization', `Bearer ${this.token}`);
  }
  
  return headers;
}
```

**Exemple de requête avec token**
```http
GET http://localhost:8080/api/admin/categories
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 📡 Endpoints API

### Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/connexion-telephone` | Envoyer le code SMS | ❌ |
| POST | `/api/auth/verifier-sms` | Vérifier le code SMS et obtenir le token | ❌ |

### Catégories

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/api/admin/categories` | Liste toutes les catégories | ✅ | ADMIN |
| POST | `/api/admin/categories` | Créer une catégorie | ✅ | ADMIN |
| PUT | `/api/admin/categories/{id}` | Modifier une catégorie | ✅ | ADMIN |
| DELETE | `/api/admin/categories/{id}` | Supprimer une catégorie | ✅ | ADMIN |

### Sous-Catégories

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/api/admin/sous-categories` | Liste toutes les sous-catégories | ✅ | ADMIN |
| POST | `/api/admin/sous-categories` | Créer une sous-catégorie | ✅ | ADMIN |
| PUT | `/api/admin/sous-categories/{id}` | Modifier une sous-catégorie | ✅ | ADMIN |
| DELETE | `/api/admin/sous-categories/{id}` | Supprimer une sous-catégorie | ✅ | ADMIN |

### Procédures

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/api/admin/procedures` | Liste toutes les procédures | ✅ | ADMIN |
| POST | `/api/admin/procedures` | Créer une procédure | ✅ | ADMIN |
| PUT | `/api/admin/procedures/{id}` | Modifier une procédure | ✅ | ADMIN |
| DELETE | `/api/admin/procedures/{id}` | Supprimer une procédure | ✅ | ADMIN |

### Utilisateurs

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/api/admin/utilisateurs` | Liste tous les utilisateurs | ✅ | ADMIN |
| POST | `/api/admin/utilisateurs` | Créer un utilisateur | ✅ | ADMIN |
| PUT | `/api/admin/utilisateurs/{id}` | Modifier un utilisateur | ✅ | ADMIN |
| DELETE | `/api/admin/utilisateurs/{id}` | Supprimer un utilisateur | ✅ | ADMIN |

### Ressources Publiques

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/centres` | Liste tous les centres | ❌ |
| GET | `/api/couts` | Liste tous les coûts | ❌ |

---

## 📦 Format des Données

### Catégorie

**Structure de données:**
```typescript
interface Categorie {
  id?: number;
  nom: string;
  description?: string;
  ordre?: number;
}
```

**Exemple de création:**
```json
{
  "nom": "État Civil",
  "description": "Documents relatifs à l'état civil",
  "ordre": 1
}
```

**Exemple de réponse:**
```json
{
  "id": 1,
  "nom": "État Civil",
  "description": "Documents relatifs à l'état civil",
  "ordre": 1,
  "dateCreation": "2025-11-10T10:00:00",
  "dateModification": "2025-11-10T10:00:00"
}
```

### Sous-Catégorie

**Structure de données:**
```typescript
interface SousCategorie {
  id?: number;
  nom: string;
  description?: string;
  categorieId: number;
  ordre?: number;
}
```

**Exemple de création:**
```json
{
  "nom": "Actes de naissance",
  "description": "Demande et obtention d'acte de naissance",
  "categorieId": 1,
  "ordre": 1
}
```

**Exemple de réponse:**
```json
{
  "id": 1,
  "nom": "Actes de naissance",
  "description": "Demande et obtention d'acte de naissance",
  "categorieId": 1,
  "categorie": {
    "id": 1,
    "nom": "État Civil"
  },
  "ordre": 1,
  "dateCreation": "2025-11-10T10:00:00",
  "dateModification": "2025-11-10T10:00:00"
}
```

### Procédure

**Structure de données:**
```typescript
interface Procedure {
  id?: number;
  titre: string;
  description: string;
  sousCategorieId: number;
  
  // Relations multiples
  centreIds: number[];       // Liste des IDs de centres
  coutIds: number[];         // Liste des IDs de coûts
  
  // Délais
  delaiTraitement?: string;  // Ex: "2 semaines"
  
  // Documents
  documentsNecessaires?: string;  // Liste des documents (texte ou JSON)
  
  // Étapes
  etapes?: Etape[];          // Liste des étapes
}

interface Etape {
  ordre: number;
  description: string;
  details?: string;
}
```

**Exemple de création:**
```json
{
  "titre": "Obtenir un extrait de naissance",
  "description": "Procédure pour obtenir un extrait d'acte de naissance",
  "sousCategorieId": 1,
  "centreIds": [1, 2, 3],
  "coutIds": [1],
  "delaiTraitement": "48 heures",
  "documentsNecessaires": "- Pièce d'identité\n- Justificatif de domicile\n- Photo d'identité",
  "etapes": [
    {
      "ordre": 1,
      "description": "Se rendre au centre d'état civil",
      "details": "Munissez-vous de vos documents"
    },
    {
      "ordre": 2,
      "description": "Remplir le formulaire de demande",
      "details": "Le formulaire est disponible sur place"
    },
    {
      "ordre": 3,
      "description": "Payer les frais",
      "details": "Paiement en espèces ou par carte"
    },
    {
      "ordre": 4,
      "description": "Récupérer le document",
      "details": "Retour dans les 48 heures"
    }
  ]
}
```

**Exemple de réponse:**
```json
{
  "id": 1,
  "titre": "Obtenir un extrait de naissance",
  "description": "Procédure pour obtenir un extrait d'acte de naissance",
  "sousCategorieId": 1,
  "sousCategorie": {
    "id": 1,
    "nom": "Actes de naissance",
    "categorie": {
      "id": 1,
      "nom": "État Civil"
    }
  },
  "centres": [
    {
      "id": 1,
      "nom": "Mairie de Ouagadougou",
      "adresse": "Avenue Kwame N'Krumah"
    },
    {
      "id": 2,
      "nom": "Mairie de Bobo-Dioulasso",
      "adresse": "Route de Sikasso"
    }
  ],
  "couts": [
    {
      "id": 1,
      "montant": 1000,
      "devise": "FCFA",
      "description": "Extrait de naissance"
    }
  ],
  "delaiTraitement": "48 heures",
  "documentsNecessaires": "- Pièce d'identité\n- Justificatif de domicile\n- Photo d'identité",
  "etapes": [
    {
      "id": 1,
      "ordre": 1,
      "description": "Se rendre au centre d'état civil",
      "details": "Munissez-vous de vos documents"
    },
    {
      "id": 2,
      "ordre": 2,
      "description": "Remplir le formulaire de demande",
      "details": "Le formulaire est disponible sur place"
    },
    {
      "id": 3,
      "ordre": 3,
      "description": "Payer les frais",
      "details": "Paiement en espèces ou par carte"
    },
    {
      "id": 4,
      "ordre": 4,
      "description": "Récupérer le document",
      "details": "Retour dans les 48 heures"
    }
  ],
  "dateCreation": "2025-11-10T10:00:00",
  "dateModification": "2025-11-10T10:00:00"
}
```

### Utilisateur

**Structure de données:**
```typescript
interface Utilisateur {
  id?: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  role: 'ADMIN' | 'USER';
  actif?: boolean;
}
```

**Exemple de création:**
```json
{
  "nom": "TRAORE",
  "prenom": "Abdoulaye",
  "telephone": "+22670123456",
  "email": "abdoulaye.traore@fasodocs.bf",
  "role": "ADMIN",
  "actif": true
}
```

**Exemple de réponse:**
```json
{
  "id": 1,
  "nom": "TRAORE",
  "prenom": "Abdoulaye",
  "telephone": "+22670123456",
  "email": "abdoulaye.traore@fasodocs.bf",
  "role": "ADMIN",
  "actif": true,
  "dateCreation": "2025-11-10T10:00:00",
  "dernièreConnexion": "2025-11-10T14:30:00"
}
```

---

## ⚠️ Gestion des Erreurs

### Format des Erreurs

Le backend doit retourner des erreurs dans un format standardisé:

```json
{
  "timestamp": "2025-11-10T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Le nom de la catégorie est obligatoire",
  "path": "/api/admin/categories"
}
```

### Codes HTTP Utilisés

| Code | Signification | Utilisation |
|------|---------------|-------------|
| 200 | OK | Requête réussie (GET, PUT) |
| 201 | Created | Ressource créée (POST) |
| 204 | No Content | Suppression réussie (DELETE) |
| 400 | Bad Request | Données invalides |
| 401 | Unauthorized | Token manquant ou invalide |
| 403 | Forbidden | Droits insuffisants (pas ADMIN) |
| 404 | Not Found | Ressource non trouvée |
| 409 | Conflict | Conflit (ex: nom déjà utilisé) |
| 500 | Internal Server Error | Erreur serveur |

### Gestion Frontend

Le frontend gère les erreurs de cette manière:

```typescript
// Exemple dans un composant
this.apiService.createCategory(category).subscribe({
  next: (response) => {
    console.log('Catégorie créée:', response);
    alert('Catégorie créée avec succès');
  },
  error: (error) => {
    console.error('Erreur:', error);
    
    if (error.status === 401) {
      alert('Session expirée, veuillez vous reconnecter');
      this.authService.logout();
    } else if (error.status === 403) {
      alert('Vous n\'avez pas les droits nécessaires');
    } else if (error.status === 409) {
      alert('Une catégorie avec ce nom existe déjà');
    } else {
      alert(error.error?.message || 'Une erreur est survenue');
    }
  }
});
```

---

## 🔄 Exemples de Requêtes Complètes

### Exemple 1: Créer une Catégorie

**Frontend Code:**
```typescript
const category = {
  nom: 'Permis de Conduire',
  description: 'Procédures relatives au permis de conduire'
};

this.apiService.createCategory(category).subscribe({
  next: (response) => console.log('Succès:', response),
  error: (error) => console.error('Erreur:', error)
});
```

**HTTP Request:**
```http
POST http://localhost:8080/api/admin/categories
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "nom": "Permis de Conduire",
  "description": "Procédures relatives au permis de conduire"
}
```

**Backend Controller:**
```java
@PostMapping("/categories")
public ResponseEntity<Categorie> createCategory(@RequestBody Categorie categorie) {
    // Validation
    if (categorie.getNom() == null || categorie.getNom().trim().isEmpty()) {
        throw new BadRequestException("Le nom de la catégorie est obligatoire");
    }
    
    // Vérifier l'unicité du nom
    if (categorieRepository.existsByNom(categorie.getNom())) {
        throw new ConflictException("Une catégorie avec ce nom existe déjà");
    }
    
    // Créer la catégorie
    Categorie created = categorieService.create(categorie);
    
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
}
```

**HTTP Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 5,
  "nom": "Permis de Conduire",
  "description": "Procédures relatives au permis de conduire",
  "ordre": null,
  "dateCreation": "2025-11-10T15:30:00",
  "dateModification": "2025-11-10T15:30:00"
}
```

### Exemple 2: Modifier une Sous-Catégorie

**Frontend Code:**
```typescript
const sousCategorieId = 3;
const updates = {
  nom: 'Passeport biométrique',
  description: 'Demande de passeport biométrique mis à jour'
};

this.apiService.updateSousCategorie(sousCategorieId, updates).subscribe({
  next: (response) => console.log('Modifié:', response),
  error: (error) => console.error('Erreur:', error)
});
```

**HTTP Request:**
```http
PUT http://localhost:8080/api/admin/sous-categories/3
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "nom": "Passeport biométrique",
  "description": "Demande de passeport biométrique mis à jour"
}
```

**Backend Controller:**
```java
@PutMapping("/sous-categories/{id}")
public ResponseEntity<SousCategorie> updateSousCategorie(
        @PathVariable Long id,
        @RequestBody SousCategorie sousCategorie) {
    
    // Vérifier que la sous-catégorie existe
    SousCategorie existing = sousCategorieRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("Sous-catégorie non trouvée"));
    
    // Mettre à jour les champs
    if (sousCategorie.getNom() != null) {
        existing.setNom(sousCategorie.getNom());
    }
    if (sousCategorie.getDescription() != null) {
        existing.setDescription(sousCategorie.getDescription());
    }
    
    // Sauvegarder
    SousCategorie updated = sousCategorieService.update(existing);
    
    return ResponseEntity.ok(updated);
}
```

### Exemple 3: Créer une Procédure Complexe

**Frontend Code:**
```typescript
const procedure = {
  titre: 'Demande de carte d\'identité nationale',
  description: 'Procédure complète pour obtenir une CNI',
  sousCategorieId: 2,
  centreIds: [1, 3, 5],
  coutIds: [2],
  delaiTraitement: '1 semaine',
  documentsNecessaires: '- Acte de naissance\n- 2 photos d\'identité\n- Certificat de résidence',
  etapes: [
    {
      ordre: 1,
      description: 'Constitution du dossier',
      details: 'Rassemblez tous les documents nécessaires'
    },
    {
      ordre: 2,
      description: 'Dépôt du dossier',
      details: 'Au service de l\'état civil de votre commune'
    },
    {
      ordre: 3,
      description: 'Prise d\'empreintes',
      details: 'Biométrie et photo sur place'
    },
    {
      ordre: 4,
      description: 'Retrait de la carte',
      details: 'Après notification par SMS'
    }
  ]
};

this.apiService.createProcedure(procedure).subscribe({
  next: (response) => {
    console.log('Procédure créée:', response);
    this.router.navigate(['/procedures']);
  },
  error: (error) => console.error('Erreur:', error)
});
```

---

## 🔍 Troubleshooting

### Problème 1: Erreur CORS

**Symptôme:**
```
Access to XMLHttpRequest at 'http://localhost:8080/api/...' from origin 'http://localhost:4200' 
has been blocked by CORS policy
```

**Solution:**
1. Vérifier la configuration CORS du backend (voir section Configuration)
2. S'assurer que `http://localhost:4200` est dans la liste des origins autorisées
3. Redémarrer le backend après modification

### Problème 2: Token JWT Invalide

**Symptôme:**
```json
{
  "status": 401,
  "message": "Token JWT invalide ou expiré"
}
```

**Solutions:**
1. Vérifier que le token est bien envoyé dans le header `Authorization`
2. Vérifier le format: `Bearer {token}` (avec un espace après "Bearer")
3. Se reconnecter pour obtenir un nouveau token
4. Vérifier la validité du token côté backend (expiration)

### Problème 3: Rôle Insuffisant

**Symptôme:**
```json
{
  "status": 403,
  "message": "Accès refusé"
}
```

**Solutions:**
1. Vérifier que l'utilisateur a le rôle ADMIN
2. Vérifier que le token contient les bonnes informations de rôle
3. S'assurer que Spring Security reconnaît le rôle (ROLE_ADMIN vs ADMIN)

### Problème 4: Relations Non Chargées

**Symptôme:**
Les relations (catégorie, sousCategorie, centres, etc.) sont null dans la réponse

**Solutions:**
1. Utiliser `@JsonManagedReference` et `@JsonBackReference` pour éviter les boucles infinies
2. Utiliser des DTOs pour contrôler exactement quelles données sont retournées
3. Configurer le chargement eager/lazy dans les entités JPA

**Exemple avec DTOs:**
```java
@GetMapping("/procedures")
public ResponseEntity<List<ProcedureDTO>> getAllProcedures() {
    List<Procedure> procedures = procedureService.findAll();
    List<ProcedureDTO> dtos = procedures.stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());
    return ResponseEntity.ok(dtos);
}

private ProcedureDTO convertToDTO(Procedure procedure) {
    ProcedureDTO dto = new ProcedureDTO();
    dto.setId(procedure.getId());
    dto.setTitre(procedure.getTitre());
    dto.setDescription(procedure.getDescription());
    
    // Ajouter la sous-catégorie avec sa catégorie parent
    if (procedure.getSousCategorie() != null) {
        SousCategorieDTO scDto = new SousCategorieDTO();
        scDto.setId(procedure.getSousCategorie().getId());
        scDto.setNom(procedure.getSousCategorie().getNom());
        
        if (procedure.getSousCategorie().getCategorie() != null) {
            CategorieDTO cDto = new CategorieDTO();
            cDto.setId(procedure.getSousCategorie().getCategorie().getId());
            cDto.setNom(procedure.getSousCategorie().getCategorie().getNom());
            scDto.setCategorie(cDto);
        }
        
        dto.setSousCategorie(scDto);
    }
    
    // Ajouter les centres
    if (procedure.getCentres() != null) {
        dto.setCentres(procedure.getCentres().stream()
            .map(this::convertCentreToDTO)
            .collect(Collectors.toList()));
    }
    
    return dto;
}
```

---

## 📊 Monitoring et Logs

### Logs Backend Recommandés

```java
@PostMapping("/categories")
public ResponseEntity<Categorie> createCategory(@RequestBody Categorie categorie) {
    log.info("Création d'une catégorie: {}", categorie.getNom());
    
    try {
        Categorie created = categorieService.create(categorie);
        log.info("Catégorie créée avec succès, ID: {}", created.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    } catch (Exception e) {
        log.error("Erreur lors de la création de la catégorie: {}", e.getMessage());
        throw e;
    }
}
```

### Logs Frontend (Angular)

Le service `ApiService` inclut déjà des logs pour le débogage:

```typescript
sendSmsCode(phoneNumber: string): Observable<any> {
  console.log('Sending SMS code request for phone number:', phoneNumber);
  
  return this.http.post(`${API_URL}/auth/connexion-telephone`, request).pipe(
    tap({
      next: (response) => console.log('SMS code request successful:', response),
      error: (error) => console.error('SMS code request failed:', error)
    })
  );
}
```

---

## 🚀 Déploiement en Production

### Checklist Backend

- [ ] Configurer HTTPS
- [ ] Utiliser des variables d'environnement pour les secrets
- [ ] Configurer les origins CORS pour le domaine de production
- [ ] Activer les logs appropriés
- [ ] Configurer un refresh token
- [ ] Mettre en place une limitation des tentatives de connexion
- [ ] Configurer les backups de la base de données

### Checklist Frontend

- [ ] Build de production: `npm run build`
- [ ] Mettre à jour `API_URL` avec l'URL de production
- [ ] Configurer HTTPS
- [ ] Optimiser les assets (images, etc.)
- [ ] Activer le mode production Angular
- [ ] Configurer le cache du navigateur

### Variables d'Environnement Backend

```properties
# application.properties (Production)
server.port=8080
spring.datasource.url=jdbc:mysql://prod-db-server:3306/fasodocs
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

jwt.secret=${JWT_SECRET}
jwt.expiration=3600000

sms.api.key=${SMS_API_KEY}
sms.api.url=https://sms-provider.com/api

cors.allowed-origins=https://admin.fasodocs.com
```

---

## 📞 Support

Pour toute question concernant l'intégration backend, contactez l'équipe de développement.

**Auteur**: Équipe FasoDocs  
**Version**: 1.0.0  
**Dernière mise à jour**: Novembre 2025

