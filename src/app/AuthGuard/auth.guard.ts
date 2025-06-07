import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  if (!authService.estaAutenticado()) {
    window.location.href = '/'; // Redirige al login
    return false;
  }
  return true;
};