import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface AquaticSpecies {
  species_id: string;
  species_name: string;
}

export interface Region {
  region_id: string;
  region_name: string;
}

export interface NewPoolData {
  pool_name: string;
  species_id: string;
  region_id: string;
  owner_id: string;
}

@Component({
  selector: 'app-add-pool-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-pool-modal.component.html',
  styleUrl: './add-pool-modal.component.scss'
})
export class AddPoolModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() poolAdded = new EventEmitter<NewPoolData>();

  isOpen = false;
  isSubmitting = false;

  // Form data
  poolName = '';
  selectedSpeciesId = '';
  selectedRegionId = '';

  // Mock data - Replace with API calls
  species: AquaticSpecies[] = [
    { species_id: 'SHRIMP_VANNAMEI', species_name: 'White Leg Shrimp (Vannamei)' },
    { species_id: 'SHRIMP_MONODON', species_name: 'Black Tiger Shrimp (Monodon)' },
    { species_id: 'FISH_TILAPIA', species_name: 'Tilapia' },
    { species_id: 'FISH_CATFISH', species_name: 'Catfish' },
    { species_id: 'FISH_CARP', species_name: 'Carp' }
  ];

  regions: Region[] = [
    { region_id: '550e8400-e29b-41d4-a716-446655440001', region_name: 'Mekong Delta' },
    { region_id: '550e8400-e29b-41d4-a716-446655440002', region_name: 'Central Coast' },
    { region_id: '550e8400-e29b-41d4-a716-446655440003', region_name: 'Northern Region' },
    { region_id: '550e8400-e29b-41d4-a716-446655440004', region_name: 'Southeast Region' }
  ];

  ngOnInit() {
    // TODO: Replace with actual API calls
    // this.loadSpecies();
    // this.loadRegions();
  }

  // TODO: Implement API call to fetch species
  // private loadSpecies() {
  //   this.speciesService.getAllSpecies().subscribe(data => {
  //     this.species = data;
  //   });
  // }

  // TODO: Implement API call to fetch regions
  // private loadRegions() {
  //   this.regionService.getAllRegions().subscribe(data => {
  //     this.regions = data;
  //   });
  // }

  open() {
    this.isOpen = true;
    this.resetForm();
  }

  closeModal() {
    this.isOpen = false;
    this.close.emit();
  }

  resetForm() {
    this.poolName = '';
    this.selectedSpeciesId = '';
    this.selectedRegionId = '';
  }

  isFormValid(): boolean {
    return this.poolName.trim() !== '' && 
           this.selectedSpeciesId !== '' && 
           this.selectedRegionId !== '';
  }

  onSubmit() {
    if (!this.isFormValid()) {
      return;
    }

    this.isSubmitting = true;

    // TODO: Get actual owner_id from authentication service
    const mockOwnerId = '550e8400-e29b-41d4-a716-446655440000';

    const newPool: NewPoolData = {
      pool_name: this.poolName,
      species_id: this.selectedSpeciesId,
      region_id: this.selectedRegionId,
      owner_id: mockOwnerId
    };

    // TODO: Replace with actual API call
    // this.poolService.createPool(newPool).subscribe({
    //   next: (response) => {
    //     this.poolAdded.emit(newPool);
    //     this.closeModal();
    //     this.isSubmitting = false;
    //   },
    //   error: (error) => {
    //     console.error('Error creating pool:', error);
    //     this.isSubmitting = false;
    //   }
    // });

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.poolAdded.emit(newPool);
      this.closeModal();
      console.log('New pool data:', newPool);
    }, 1000);
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }
}
