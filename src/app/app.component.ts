import { Component, OnInit, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface WorkoutEntry {
  userName: string;
  workoutType: string;
  workoutMinutes: number;
}

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.css'] ,
  template: `
    <div class="min-h-screen bg-blue-100 p-8">
      <div class="max-w-screen-xl mx-auto bg-purple-100 rounded-lg shadow-md p-6">
        <h1 class="text-4xl font-bold text-primary mb-8 text-center">Health Challenge Tracker App</h1>

        <form #workoutForm="ngForm" (ngSubmit)="onSubmit(workoutForm)" class="mb-10">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="userName" class="block text-sm font-medium text-text mb-1">User Name*</label>
              <input type="text" id="userName" name="userName" [(ngModel)]="userName" required
                     class="w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"/>
            </div>
            <div>
              <label for="workoutType" class="block text-sm font-medium text-text mb-1">Workout Type*</label>
              <select id="workoutType" name="workoutType" [(ngModel)]="workoutType" required
                      class="w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary">
                <option value="" disabled>Select a workout type</option>
                <option *ngFor="let type of availableWorkoutTypes" [value]="type">{{type}}</option>
              </select>
            </div>
            <div>
              <label for="workoutMinutes" class="block text-sm font-medium text-text mb-1">Workout Minutes*</label>
              <input type="number" id="workoutMinutes" name="workoutMinutes" [(ngModel)]="workoutMinutes" required
                     class="w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"/>
            </div>
          </div>
          <button type="submit" [disabled]="!workoutForm.form.valid"
                  class="mt-6 w-full md:w-auto bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg shadow">
            Add Workout
          </button>
        </form>

        <div class="mt-10">
          <h2 class="text-2xl font-semibold text-text mb-5">Workout Entries</h2>
          <div class="flex flex-col md:flex-row gap-4 mb-5">
            <input type="text" placeholder="Search by name" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()"
                   class="px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"/>
            <select [(ngModel)]="filterType" (ngModelChange)="applyFilters()"
                    class="px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary">
              <option value="">All Workout Types</option>
              <option *ngFor="let type of availableWorkoutTypes" [value]="type">{{type}}</option>
            </select>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full border border-border divide-y divide-border">
              <thead class="bg-background">
                <tr>
                  <th class="px-4 py-2 text-left text-sm font-semibold text-text">Name</th>
                  <th class="px-4 py-2 text-left text-sm font-semibold text-text">Workouts</th>
                  <th class="px-4 py-2 text-left text-sm font-semibold text-text">Number of Workouts</th>
                  <th class="px-4 py-2 text-left text-sm font-semibold text-text">Total Workout Minutes</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-border">
                <tr *ngFor="let entry of paginatedEntries" class="hover:bg-background">
                  <td class="px-4 py-2">{{entry.userName}}</td>
                  <td class="px-4 py-2">{{entry.workoutType}}</td>
                  <td class="px-4 py-2">{{getNumberOfWorkouts(entry.userName)}}</td>
                  <td class="px-4 py-2">{{getTotalWorkoutMinutes(entry.userName)}}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex justify-between items-center mt-6">
            <button (click)="changePage(-1)" [disabled]="currentPage === 1"
                    class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">
              &lt;
            </button>
            <span>Page {{currentPage}} of {{totalPages}}</span>
            <button (click)="changePage(1)" [disabled]="currentPage === totalPages"
                    class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">
              &gt;
            </button>
            <select [(ngModel)]="itemsPerPage" (ngModelChange)="applyFilters()"
                    class="ml-2 px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary">
              <option [value]="5">5 per page</option>
              <option [value]="10">10 per page</option>
              <option [value]="20">20 per page</option>
            </select>
          </div>
        </div>

        <div class="mt-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="md:col-span-1">
            <h2 class="text-2xl font-semibold text-text mb-5">Users</h2>
            <ul class="bg-white border border-border rounded-lg divide-y divide-border">
              <li *ngFor="let user of getUniqueUsers()"
                  (click)="selectUser(user)"
                  [class.selected]="user === selectedUser"
                  class="px-4 py-2 cursor-pointer hover:bg-background">
                {{user}}
              </li>
            </ul>
          </div>
          <div class="md:col-span-3">
            <h2 class="text-2xl font-semibold text-text mb-5">{{selectedUser}}'s Workout Progress</h2>
            <div class="bg-white border border-border rounded-lg shadow-md p-6">
              <canvas id="chartCanvas" class="w-full h-64"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  
  `
})
export class AppComponent implements OnInit {
  userName: string = '';
  workoutType: string = '';
  workoutMinutes: number = 0;
  workoutEntries: WorkoutEntry[] = [];
  filteredEntries: WorkoutEntry[] = [];
  paginatedEntries: WorkoutEntry[] = [];
  selectedUser: string | null = null;
  chart: Chart | null = null;

  searchTerm: string = '';
  filterType: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  availableWorkoutTypes: string[] = [
    'Running', 'Walking', 'Cycling', 'Swimming', 'Weightlifting',
    'Yoga', 'Pilates', 'HIIT', 'Dance', 'Martial Arts'
  ];

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.loadFromLocalStorage();
    this.applyFilters();
  }

  loadFromLocalStorage() {
    const storedData = localStorage.getItem('workoutEntries');
    if (storedData) {
      this.workoutEntries = JSON.parse(storedData);
    } else {
      // Initialize with sample data if localStorage is empty
      this.workoutEntries = [
        { userName: 'John Doe', workoutType: 'Running', workoutMinutes: 30 },
        { userName: 'John Doe', workoutType: 'Cycling', workoutMinutes: 45 },
        { userName: 'Jane Smith', workoutType: 'Swimming', workoutMinutes: 60 },
        { userName: 'Jane Smith', workoutType: 'Running', workoutMinutes: 20 },
        { userName: 'Mike Johnson', workoutType: 'Yoga', workoutMinutes: 50 },
        { userName: 'Mike Johnson', workoutType: 'Cycling', workoutMinutes: 40 }
      ];
      this.saveToLocalStorage();
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('workoutEntries', JSON.stringify(this.workoutEntries));
  }

  onSubmit(form: NgForm | any) {
    if (form.valid) {
      this.workoutEntries.push({
        userName: this.userName,
        workoutType: this.workoutType,
        workoutMinutes: this.workoutMinutes
      });
      this.saveToLocalStorage();
      this.applyFilters();
      this.selectUser(this.userName);
      this.resetForm(form);
    }
  }

  resetForm(form: NgForm | any) {
    if (form.resetForm && typeof form.resetForm === 'function') {
      form.resetForm();
    }
    // Reset component properties
    this.userName = '';
    this.workoutType = '';
    this.workoutMinutes = 0;
  }

  getUniqueUsers(): string[] {
    return Array.from(new Set(this.workoutEntries.map(entry => entry.userName)));
  }

  selectUser(user: string) {
    this.selectedUser = user;
    this.updateChart();
  }

  updateChart() {
    if (this.selectedUser) {
      const canvas = this.elementRef.nativeElement.querySelector('#chartCanvas');
      if (!canvas) return;

      const userEntries = this.workoutEntries.filter(entry => entry.userName === this.selectedUser);
      const workoutData: { [key: string]: number } = {};

      userEntries.forEach(entry => {
        if (workoutData[entry.workoutType]) {
          workoutData[entry.workoutType] += entry.workoutMinutes;
        } else {
          workoutData[entry.workoutType] = entry.workoutMinutes;
        }
      });

      const labels = Object.keys(workoutData);
      const data = Object.values(workoutData);

      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Workout Minutes',
            data: data,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  applyFilters() {
    this.filteredEntries = this.workoutEntries.filter(entry => {
      const nameMatch = entry.userName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const typeMatch = this.filterType ? entry.workoutType === this.filterType : true;
      return nameMatch && typeMatch;
    });
    this.totalPages = Math.ceil(this.filteredEntries.length / this.itemsPerPage);
    this.currentPage = 1;
    this.updatePaginatedEntries();
  }

  updatePaginatedEntries() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedEntries = this.filteredEntries.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(delta: number) {
    this.currentPage += delta;
    this.updatePaginatedEntries();
  }

  getNumberOfWorkouts(userName: string): number {
    return this.workoutEntries.filter(entry => entry.userName === userName).length;
  }

  getTotalWorkoutMinutes(userName: string): number {
    return this.workoutEntries
      .filter(entry => entry.userName === userName)
      .reduce((total, entry) => total + entry.workoutMinutes, 0);
  }
}