/**
 * ADD POOL MODAL COMPONENT
 * ========================
 * This component provides a modal dialog for creating a new aquaculture pool.
 * It includes a form with validation for pool name, species selection, and region selection.
 * 
 * Features:
 * - Form validation before submission
 * - Loading state during submission
 * - Event emitters for parent component communication
 * - Modal can be closed by backdrop click or close button
 * 
 * Usage:
 * 1. Add component to parent template: <app-add-pool-modal></app-add-pool-modal>
 * 2. Use ViewChild to access component methods
 * 3. Call open() method to display modal
 * 4. Listen to poolAdded event for successful creation
 */

import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Interface for Aquatic Species data structure
 * Matches the database table: aquatic_species
 */
export interface AquaticSpecies {
  species_id: string;      // Unique identifier for the species (e.g., 'SHRIMP_VANNAMEI')
  species_name: string;    // Human-readable species name (e.g., 'White Leg Shrimp')
}

/**
 * Interface for Region data structure
 * Matches the database table: region
 */
export interface Region {
  region_id: string;       // UUID identifier for the region
  region_name: string;     // Human-readable region name (e.g., 'Mekong Delta')
}

/**
 * Interface for new pool data structure
 * Matches the required fields for the pool database table
 */
export interface NewPoolData {
  pool_name: string;       // Name of the pool (e.g., 'Main Shrimp Pool A1')
  species_id: string;      // Foreign key to aquatic_species table
  region_id: string;       // Foreign key to region table
  owner_id: string;        // Foreign key to users table (current user)
}

@Component({
  selector: 'app-add-pool-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],  // CommonModule for *ngIf, FormsModule for [(ngModel)]
  templateUrl: './add-pool-modal.component.html',
  styleUrl: './add-pool-modal.component.scss'
})
export class AddPoolModalComponent implements OnInit {
  
  // ==================== OUTPUTS ====================
  /**
   * Emitted when the modal is closed (by user action)
   * Parent component can listen to this to perform cleanup
   */
  @Output() close = new EventEmitter<void>();
  
  /**
   * Emitted when a pool is successfully created
   * Contains the new pool data that was submitted
   * Parent component can use this to refresh pool list or show success message
   */
  @Output() poolAdded = new EventEmitter<NewPoolData>();

  // ==================== COMPONENT STATE ====================
  /**
   * Controls modal visibility
   * true = modal is displayed, false = modal is hidden
   */
  isOpen = false;
  
  /**
   * Tracks form submission state
   * true = form is being submitted (shows loading state)
   * false = form is idle (allows submission)
   */
  isSubmitting = false;

  // ==================== FORM DATA ====================
  /**
   * Stores the pool name input value
   * Bound to input field via [(ngModel)]
   */
  poolName = '';
  
  /**
   * Stores the selected species ID
   * Bound to species dropdown via [(ngModel)]
   */
  selectedSpeciesId = '';
  
  /**
   * Stores the selected region ID
   * Bound to region dropdown via [(ngModel)]
   */
  selectedRegionId = '';

  // ==================== DROPDOWN OPTIONS ====================
  /**
   * List of available aquatic species for user selection
   * TODO: Replace with actual API call in ngOnInit
   * Current implementation uses mock data for demonstration
   */
  species: AquaticSpecies[] = [
    { species_id: 'SHRIMP_VANNAMEI', species_name: 'White Leg Shrimp (Vannamei)' },
    { species_id: 'SHRIMP_MONODON', species_name: 'Black Tiger Shrimp (Monodon)' },
    { species_id: 'FISH_TILAPIA', species_name: 'Tilapia' },
    { species_id: 'FISH_CATFISH', species_name: 'Catfish' },
    { species_id: 'FISH_CARP', species_name: 'Carp' }
  ];

  /**
   * List of available regions for user selection
   * TODO: Replace with actual API call in ngOnInit
   * Current implementation uses mock data with UUID examples
   */
  regions: Region[] = [
    { region_id: '550e8400-e29b-41d4-a716-446655440001', region_name: 'Mekong Delta' },
    { region_id: '550e8400-e29b-41d4-a716-446655440002', region_name: 'Central Coast' },
    { region_id: '550e8400-e29b-41d4-a716-446655440003', region_name: 'Northern Region' },
    { region_id: '550e8400-e29b-41d4-a716-446655440004', region_name: 'Southeast Region' }
  ];

  // ==================== LIFECYCLE HOOKS ====================
  /**
   * Angular lifecycle hook - called when component is initialized
   * This is where you should load dropdown data from APIs
   * 
   * TODO: Implement the following:
   * 1. Call API to fetch species list
   * 2. Call API to fetch regions list
   * 3. Handle loading states and errors
   */
  ngOnInit() {
    // TODO: Replace with actual API calls
    // this.loadSpecies();
    // this.loadRegions();
  }

  // ==================== API INTEGRATION METHODS ====================
  // TODO: Implement API call to fetch species
  // private loadSpecies() {
  //   this.speciesService.getAllSpecies().subscribe({
  //     next: (data) => {
  //       this.species = data;
  //     },
  //     error: (error) => {
  //       console.error('Error loading species:', error);
  //       // Show error message to user
  //     }
  //   });
  // }

  // TODO: Implement API call to fetch regions
  // private loadRegions() {
  //   this.regionService.getAllRegions().subscribe({
  //     next: (data) => {
  //       this.regions = data;
  //     },
  //     error: (error) => {
  //       console.error('Error loading regions:', error);
  //       // Show error message to user
  //     }
  //   });
  // }

  // ==================== MODAL CONTROL METHODS ====================
  /**
   * Opens the modal and resets the form
   * Called programmatically from parent component
   * 
   * Usage:
   * @ViewChild(AddPoolModalComponent) modal!: AddPoolModalComponent;
   * this.modal.open();
   */
  open() {
    this.isOpen = true;      // Show the modal
    this.resetForm();        // Clear any previous form data
  }

  /**
   * Closes the modal and emits close event
   * Can be called by:
   * - Close button (X) click
   * - Backdrop click
   * - After successful submission
   */
  closeModal() {
    this.isOpen = false;     // Hide the modal
    this.close.emit();       // Notify parent component
  }

  /**
   * Resets all form fields to their initial empty state
   * Called when modal is opened to ensure clean state
   */
  resetForm() {
    this.poolName = '';
    this.selectedSpeciesId = '';
    this.selectedRegionId = '';
  }

  // ==================== FORM VALIDATION ====================
  /**
   * Validates the form before submission
   * 
   * Validation rules:
   * - Pool name must not be empty (trimmed)
   * - Species must be selected
   * - Region must be selected
   * 
   * @returns true if form is valid, false otherwise
   * 
   * Used to:
   * - Disable submit button in template
   * - Prevent submission of invalid data
   */
  isFormValid(): boolean {
    return this.poolName.trim() !== '' && 
           this.selectedSpeciesId !== '' && 
           this.selectedRegionId !== '';
  }

  // ==================== FORM SUBMISSION ====================
  /**
   * Handles form submission
   * 
   * Flow:
   * 1. Validate form data
   * 2. Set loading state
   * 3. Prepare pool data object
   * 4. Call API to create pool (TODO)
   * 5. Emit success event
   * 6. Close modal
   * 
   * TODO: Replace setTimeout with actual API call to backend
   * See ADD_POOL_API_INTEGRATION.md for detailed integration guide
   */
  onSubmit() {
    // Early return if form is invalid
    if (!this.isFormValid()) {
      return;
    }

    // Set loading state (disables button, shows spinner)
    this.isSubmitting = true;

    // TODO: Get actual owner_id from authentication service
    // Example: const ownerId = this.authService.getCurrentUserId();
    const mockOwnerId = '550e8400-e29b-41d4-a716-446655440000';

    // Prepare data object matching the database schema
    const newPool: NewPoolData = {
      pool_name: this.poolName,
      species_id: this.selectedSpeciesId,
      region_id: this.selectedRegionId,
      owner_id: mockOwnerId
    };

    // TODO: Replace with actual API call
    // this.poolService.createPool(newPool).subscribe({
    //   next: (response) => {
    //     this.poolAdded.emit(response);  // Emit the created pool data
    //     this.closeModal();               // Close the modal
    //     this.isSubmitting = false;       // Reset loading state
    //     // Optional: Show success toast notification
    //   },
    //   error: (error) => {
    //     console.error('Error creating pool:', error);
    //     this.isSubmitting = false;       // Reset loading state
    //     // Show error message to user
    //   }
    // });

    // Simulate API call with 1 second delay
    setTimeout(() => {
      this.isSubmitting = false;        // Reset loading state
      this.poolAdded.emit(newPool);     // Emit success event with data
      this.closeModal();                 // Close the modal
      console.log('New pool data:', newPool);  // Log for debugging
    }, 1000);
  }

  // ==================== EVENT HANDLERS ====================
  /**
   * Handles clicks on the modal backdrop
   * Closes the modal only if user clicked directly on backdrop
   * (not on the modal content itself)
   * 
   * @param event - Mouse click event
   */
  onBackdropClick(event: MouseEvent) {
    // Check if the clicked element has the 'modal-backdrop' class
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }
}
