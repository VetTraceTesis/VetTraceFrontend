import { Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { ModulosComponent } from './component/modulos/modulos.component';
import { DoctorComponent } from './component/doctor/doctor.component';
import { DoctorDetalleComponent } from './component/doctor/doctor-detalle/doctor-detalle.component';
import { DuenioComponent } from './component/duenio/duenio.component';
import { DuenioDetalleComponent } from './component/duenio/duenio-detalle/duenio-detalle.component';
import { AtencionesComponent } from './component/atenciones/atenciones.component';
import { AtencionesDetailComponent } from './component/atenciones/atenciones-detail/atenciones-detail.component';
import { AtencionesInsertComponent } from './component/atenciones/atenciones-insert/atenciones-insert.component';
import { AtencionesDiagnosticoComponent } from './component/atenciones/atenciones-detail/atenciones-diagnostico/atenciones-diagnostico.component';
import { MapaComponent } from './component/mapa/mapa.component';
import { authGuard } from './AuthGuard/auth.guard';
import { CitasComponent } from './component/citas/citas.component';
import { CitasModalComponent } from './component/citas/citas-modal/citas-modal.component';
import { PerfilComponent } from './component/perfil/perfil.component';
import { FarmaciaComponent } from './component/farmacia/farmacia.component';
import { PanelAdministradorComponent } from './component/panel-administrador/panel-administrador.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'doctor', component: DoctorComponent, canActivate: [authGuard]  },
  { path: 'doctor-detail/:id', component: DoctorDetalleComponent, canActivate: [authGuard]   },  // Ruta para el detalle del doctor
  { path: 'doctor-veterinario/nuevo', component: DoctorDetalleComponent, canActivate: [authGuard]   },  // Ruta para agregar nuevo doctor

  { path: 'duenio', component: DuenioComponent, canActivate: [authGuard]   },  // Ruta para el componente de Duenio
  { path: 'duenio-detalle/:id', component: DuenioDetalleComponent, canActivate: [authGuard]   },  // Ruta para el detalle del doctor
  { path: 'duenio/nuevo', component: DuenioDetalleComponent, canActivate: [authGuard]   },  // Ruta para agregar nuevo doctor

  { path: 'atenciones', component: AtencionesComponent, canActivate: [authGuard]   },  // Ruta para agregar nuevo doctor
  { path: 'atenciones/duenio/:duenoId', component: AtencionesDetailComponent, canActivate: [authGuard]   },
  { path: 'atenciones/nuevo/:duenoId', component: AtencionesInsertComponent, canActivate: [authGuard]   },
  { path: 'atenciones/diagnostico/:atencionId/:tipodiagnosticoId', component: AtencionesDiagnosticoComponent, canActivate: [authGuard]   },

  { path: 'mapa', component: MapaComponent, canActivate: [authGuard]   },  
    { path: 'mapa/:correlativo', component: MapaComponent, canActivate: [authGuard]   },  

  { path: 'farmacia', component: FarmaciaComponent, canActivate: [authGuard]   },  

  { path: 'citas', component: CitasComponent, canActivate: [authGuard]   },  
  { path: 'citasmodal', component: CitasModalComponent, canActivate: [authGuard]   },  

  { path: 'modulos', component: ModulosComponent, canActivate: [authGuard]   },

  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard]   },
  { path: 'panelAdministrador', component: PanelAdministradorComponent, canActivate: [authGuard]   }

];
