import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { LayoutComponent } from './layout.component';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutComponent, RouterTestingModule],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have navigation items', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const navItems = compiled.querySelectorAll('.nav-item');
    expect(navItems.length).toBeGreaterThan(0);
  });

  it('should display FacoDocs logo', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const appName = compiled.querySelector('.app-name');
    expect(appName?.textContent).toContain('FacoDocs');
  });
});
