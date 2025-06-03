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

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'doctor', component: DoctorComponent },
  { path: 'doctor-detail/:id', component: DoctorDetalleComponent },  // Ruta para el detalle del doctor
  { path: 'doctor-veterinario/nuevo', component: DoctorDetalleComponent },  // Ruta para agregar nuevo doctor

  { path: 'duenio', component: DuenioComponent },  // Ruta para el componente de Duenio
  { path: 'duenio-detalle/:id', component: DuenioDetalleComponent },  // Ruta para el detalle del doctor
  { path: 'duenio/nuevo', component: DuenioDetalleComponent },  // Ruta para agregar nuevo doctor

  { path: 'atenciones', component: AtencionesComponent },  // Ruta para agregar nuevo doctor
  { path: 'atenciones/duenio/:duenoId', component: AtencionesDetailComponent },
  { path: 'atenciones/nuevo/:duenoId', component: AtencionesInsertComponent },
  { path: 'atenciones/diagnostico/:atencionId', component: AtencionesDiagnosticoComponent },

  { path: 'mapa', component: MapaComponent },  


  { path: 'modulos', component: ModulosComponent }
];
