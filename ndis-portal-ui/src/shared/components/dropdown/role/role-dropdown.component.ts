import { Component, signal, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import {
  DropdownUIComponent,
  DropdownOption,
} from '../../../ui/dropdown/dropdown.ui';

@Component({
  selector: 'app-role-dropdown',
  standalone: true,
  imports: [CommonModule, DropdownUIComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RoleDropdownComponent),
      multi: true,
    },
  ],
  template: `
    <app-dropdown-ui
      variant="variant1"
      [label]="selectedRoleLabel()"
      [options]="roleOptions"
      [selectedValue]="currentRole()"
      (onSelect)="handleRoleChange($event)"
    >
      
    </app-dropdown-ui>
  `,
})
export class RoleDropdownComponent implements ControlValueAccessor {
  roleOptions: DropdownOption[] = [
    { label: 'Coordinator', value: 'coordinator' },
    { label: 'Participant', value: 'participant' },
    { isDivider: true, label: '', value: null },
  ];

  currentRole = signal<string>('');
  onChange: any = () => {};
  onTouched: any = () => {};

  selectedRoleLabel() {
    const selected = this.roleOptions.find(
      (opt) => opt.value === this.currentRole(),
    );
    return selected ? selected.label : 'Select Role';
  }

  handleRoleChange(role: string) {
    this.currentRole.set(role);
    this.onChange(role);
    this.onTouched();
  }

  writeValue(role: string): void {
    this.currentRole.set(role || '');
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}