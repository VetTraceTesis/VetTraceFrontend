import {
  Component,
  Inject,
  OnInit,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {
  MatAutocompleteModule,
  MatAutocompleteTrigger
} from '@angular/material/autocomplete';
import { debounceTime } from 'rxjs/operators';

import { Medicamento } from '../../../../../model/medicamento.model';
import { FarmaciaProductosService } from '../../../../../service/farmacia-productos.service';
import { ProductoAll } from '../../../../../model/farmacia-productos-detalle.model';

@Component({
  selector: 'app-medication-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule
  ],
  templateUrl: './medicamento-modal.component.html',
  styleUrls: ['./medicamento-modal.component.css']
})
export class MedicamentoModalComponent implements OnInit, AfterViewInit {
  medicamento!: Medicamento;

  // Control y colecciones para el autocomplete
  productoControl = new FormControl<string | ProductoAll>('');
  allProductos: ProductoAll[] = [];
  filteredProductos: ProductoAll[] = [];

  // Capturamos el trigger del autocomplete
  @ViewChild('trigger', { read: MatAutocompleteTrigger })
  autocompleteTrigger!: MatAutocompleteTrigger;

  constructor(
    private dialogRef: MatDialogRef<MedicamentoModalComponent>,
    private farmaciaProductosService: FarmaciaProductosService,
    @Inject(MAT_DIALOG_DATA) public data: { idReceta: number }
  ) {}

  ngOnInit(): void {
    // Inicializamos el modelo
    this.medicamento = {
      id: 0,
      medicamento: '',
      cantidad: '',
      indicacion: '',
      id_receta: this.data.idReceta
    };

    // Cargamos (y cacheamos) la lista completa
    this.farmaciaProductosService.getAllProductos()
      .subscribe(list => {
        this.allProductos = list;
        this.filteredProductos = list;
      });
  }

  ngAfterViewInit(): void {
    // Filtrado en memoria con panel instantáneo
    this.productoControl.valueChanges
      .pipe(debounceTime(200))
      .subscribe(val => {
        const term = typeof val === 'string'
          ? val.trim().toLowerCase()
          : (val?.name || '').toLowerCase();

        if (term.length >= 2) {
          this.filteredProductos = this.allProductos.filter(p =>
            p.name.toLowerCase().includes(term)
          );
          this.autocompleteTrigger.openPanel();
        } else {
          this.filteredProductos = [];
          this.autocompleteTrigger.closePanel();
        }
      });
  }

  displayFn(prod: ProductoAll): string {
    return prod ? prod.name : '';
  }

  onOptionSelected(option: ProductoAll) {
    this.medicamento.medicamento = option.name;
  }

  guardar(): void {
    const val = this.productoControl.value;
    this.medicamento.medicamento =
      typeof val === 'string' ? val : val?.name || '';
    this.dialogRef.close(this.medicamento);
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
