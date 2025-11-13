# 🔧 Création de l'endpoint `/admin/profile` dans le backend

## 📝 Problème identifié

L'utilisateur ADMIN connecté est stocké dans la table `citoyens` (pas `utilisateurs`), donc il n'apparaît pas dans la liste retournée par `/admin/utilisateurs`. Son profil ne peut donc pas être affiché.

## ✅ Solution

Créer un endpoint dédié `/admin/profile` qui retourne le profil de l'utilisateur actuellement connecté basé sur le **token JWT**, en cherchant dans la table `citoyens`.

---

## 🚀 Implémentation dans le backend Spring Boot

### 1. Créer une méthode dans votre `AdminController` ou `AuthController`

```java
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private CitoyenService citoyenService;

    /**
     * Récupère le profil de l'administrateur actuellement connecté
     * Utilise le token JWT pour identifier l'utilisateur
     * IMPORTANT : Cherche dans la table "citoyens"
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile(Authentication authentication) {
        try {
            // Récupérer le téléphone depuis le token JWT
            String telephone = authentication.getName(); // ou getPrincipal() selon votre config
            
            System.out.println("🔍 Recherche du profil pour le téléphone: " + telephone);
            
            // Chercher le citoyen par son téléphone dans la table "citoyens"
            Citoyen citoyen = citoyenService.findByTelephone(telephone)
                .orElseThrow(() -> new RuntimeException("Citoyen non trouvé avec le téléphone: " + telephone));
            
            System.out.println("✅ Citoyen trouvé: " + citoyen.getNom() + " " + citoyen.getPrenom());
            
            // Créer un DTO avec les informations nécessaires
            CitoyenProfileDTO profile = new CitoyenProfileDTO(
                citoyen.getId(),
                citoyen.getNom(),
                citoyen.getPrenom(),
                citoyen.getTelephone(),
                citoyen.getEmail(),
                "ADMIN" // Le rôle est ADMIN car c'est un administrateur connecté
            );
            
            return ResponseEntity.ok(profile);
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la récupération du profil: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Erreur lors de la récupération du profil: " + e.getMessage()));
        }
    }
}
```

### 2. Créer un DTO pour la réponse (optionnel mais recommandé)

```java
package com.fasodocs.dto;

public class CitoyenProfileDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String telephone;
    private String email;
    private String role;

    // Constructeur
    public CitoyenProfileDTO(Long id, String nom, String prenom, 
                              String telephone, String email, String role) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.telephone = telephone;
        this.email = email;
        this.role = role;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
```

### 3. Ajouter une méthode dans `CitoyenService` si nécessaire

```java
@Service
public class CitoyenService {
    
    @Autowired
    private CitoyenRepository citoyenRepository;
    
    /**
     * Trouve un citoyen par son numéro de téléphone
     * IMPORTANT : Gère les différents formats de téléphone
     * Exemples : +22370000000, 70000000, +226 70 00 00 00
     */
    public Optional<Citoyen> findByTelephone(String telephone) {
        System.out.println("🔍 Recherche dans citoyens avec téléphone: " + telephone);
        
        // Essayer d'abord avec le téléphone exact
        Optional<Citoyen> citoyen = citoyenRepository.findByTelephone(telephone);
        
        if (citoyen.isEmpty()) {
            // Si pas trouvé, essayer avec les 8 derniers chiffres
            String normalizedPhone = telephone.replaceAll("\\D", "");
            if (normalizedPhone.length() >= 8) {
                String lastEightDigits = normalizedPhone.substring(normalizedPhone.length() - 8);
                System.out.println("🔍 Recherche avec les 8 derniers chiffres: " + lastEightDigits);
                citoyen = citoyenRepository.findByTelephoneLike("%" + lastEightDigits);
            }
        }
        
        return citoyen;
    }
}
```

### 4. S'assurer que le repository a les méthodes nécessaires

```java
@Repository
public interface CitoyenRepository extends JpaRepository<Citoyen, Long> {
    Optional<Citoyen> findByTelephone(String telephone);
    
    // Méthode pour rechercher avec LIKE (gère les différents formats)
    @Query("SELECT c FROM Citoyen c WHERE c.telephone LIKE %:phone%")
    Optional<Citoyen> findByTelephoneLike(@Param("phone") String phone);
}
```

---

## 🔐 Configuration de sécurité

Assurez-vous que l'endpoint est accessible aux utilisateurs authentifiés :

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").authenticated() // Requiert une authentification
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

---

## 📊 Format de la réponse attendue

L'endpoint doit retourner un JSON comme celui-ci :

```json
{
  "id": 1,
  "nom": "Doe",
  "prenom": "John",
  "telephone": "+22670123456",
  "email": "john.doe@example.com",
  "role": "ADMIN"
}
```

---

## 🧪 Test de l'endpoint

### Avec curl :

```bash
curl -X GET http://localhost:8080/api/admin/profile \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json"
```

### Avec Postman :
1. Méthode : `GET`
2. URL : `http://localhost:8080/api/admin/profile`
3. Headers :
   - `Authorization: Bearer VOTRE_TOKEN_JWT`
   - `Content-Type: application/json`

---

## ⚠️ Points importants

1. **Le token JWT doit contenir le téléphone de l'utilisateur** comme principal ou dans les claims
2. **L'administrateur ADMIN doit être présent dans la table `citoyens`** de votre base de données
3. **Le champ `telephone` doit correspondre** au numéro utilisé lors de la connexion (gestion des différents formats incluse)
4. **ATTENTION** : La table est `citoyens`, pas `utilisateurs` !
5. Le code gère automatiquement les formats : `+22370000000`, `70000000`, etc.

---

## 🔄 Alternative : Récupérer l'ID depuis le token

Si votre token JWT contient l'ID du citoyen :

```java
@GetMapping("/profile")
public ResponseEntity<?> getCurrentUserProfile(Authentication authentication) {
    try {
        // Si votre token JWT contient l'ID du citoyen
        Long citoyenId = Long.parseLong(authentication.getName()); // ou depuis un claim
        
        Citoyen citoyen = citoyenService.findById(citoyenId)
            .orElseThrow(() -> new RuntimeException("Citoyen non trouvé"));
        
        CitoyenProfileDTO profile = new CitoyenProfileDTO(
            citoyen.getId(),
            citoyen.getNom(),
            citoyen.getPrenom(),
            citoyen.getTelephone(),
            citoyen.getEmail(),
            "ADMIN"
        );
        
        return ResponseEntity.ok(profile);
        
    } catch (Exception e) {
        System.err.println("❌ Erreur: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("message", "Erreur lors de la récupération du profil"));
    }
}
```

---

## ✅ Vérification

Après avoir créé l'endpoint :

1. **Redémarrez votre backend Spring Boot**
2. **Rafraîchissez votre application Angular**
3. **Ouvrez la console du navigateur** (F12)
4. **Accédez à la page profil**

Vous devriez voir :
```
🔐 Fetching current user profile from backend...
✅ User profile received from /admin/profile: {...}
✅ User profile loaded successfully: {...}
```

Si l'endpoint n'existe pas encore, vous verrez le fallback :
```
⚠️ /admin/profile endpoint not available or error occurred
📋 Falling back to searching in users list...
```

---

## 📞 Besoin d'aide ?

Si vous avez des questions sur l'implémentation, n'hésitez pas à me montrer :
- Votre structure de `Utilisateur` entity
- Votre configuration JWT
- Les logs du backend

