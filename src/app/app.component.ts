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
  styleUrls: ['./app.component.css'],
  template: `
    <div class="min-h-screen bg-gray-100 p-8">
      <div class="max-w-screen-xl mx-auto bg-white rounded-lg shadow-lg p-8 transform transition-all duration-500 hover:shadow-2xl">
        <h1 class="text-5xl font-extrabold text-black mb-10 text-center animate-fade-in">
          Health Challenge Tracker
        </h1>

        <form #workoutForm="ngForm" (ngSubmit)="onSubmit(workoutForm)" class="mb-10">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="userName" class="block text-sm font-medium text-gray-700 mb-2">User Name*</label>
              <input type="text" id="userName" name="userName" [(ngModel)]="userName" required
                     class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"/>
            </div>
            <div>
              <label for="workoutType" class="block text-sm font-medium text-gray-700 mb-2">Workout Type*</label>
              <select id="workoutType" name="workoutType" [(ngModel)]="workoutType" required
                      class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-300">
                <option value="" disabled class="text-gray-900">Select a workout type</option>
                <option *ngFor="let type of availableWorkoutTypes" [value]="type" class="text-gray-900">{{type}}</option>
              </select>
            </div>
            <div>
              <label for="workoutMinutes" class="block text-sm font-medium text-gray-700 mb-2">Workout Minutes*</label>
              <input type="number" id="workoutMinutes" name="workoutMinutes" [(ngModel)]="workoutMinutes" required
                     class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"/>
            </div>
          </div>
          <button type="submit" [disabled]="!workoutForm.form.valid"
                  class="mt-6 w-full md:w-auto bg-black text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105">
            Add Workout
          </button>
        </form>

        <div class="mt-10">
          <h2 class="text-3xl font-bold text-black mb-6 animate-fade-in">Workout Entries</h2>
          <div class="flex flex-col md:flex-row gap-4 mb-6">
            <input type="text" placeholder="Search by name" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()"
                   class="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"/>
            <select [(ngModel)]="filterType" (ngModelChange)="applyFilters()"
                    class="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-300">
              <option value="" class="text-gray-900">All Workout Types</option>
              <option *ngFor="let type of availableWorkoutTypes" [value]="type" class="text-gray-900">{{type}}</option>
            </select>
          </div>
          <div class="overflow-x-auto rounded-lg shadow-md">
            <table class="min-w-full border border-gray-200 divide-y divide-gray-200">
              <thead class="bg-black">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Name</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Workouts</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Number of Workouts</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Total Workout Minutes</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let entry of paginatedEntries" class="hover:bg-gray-50 transition-all duration-200">
                  <td class="px-6 py-4 text-gray-900">{{entry.userName}}</td>
                  <td class="px-6 py-4 text-gray-900">{{entry.workoutType}}</td>
                  <td class="px-6 py-4 text-gray-900">{{getNumberOfWorkouts(entry.userName)}}</td>
                  <td class="px-6 py-4 text-gray-900">{{getTotalWorkoutMinutes(entry.userName)}}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex justify-between items-center mt-6">
            <button (click)="changePage(-1)" [disabled]="currentPage === 1"
                    class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105">
              &lt;
            </button>
            <span class="text-gray-700">Page {{currentPage}} of {{totalPages}}</span>
            <button (click)="changePage(1)" [disabled]="currentPage === totalPages"
                    class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105">
              &gt;
            </button>
            <select [(ngModel)]="itemsPerPage" (ngModelChange)="applyFilters()"
                    class="ml-2 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-300">
              <option [value]="5" class="text-gray-900">5 per page</option>
              <option [value]="10" class="text-gray-900">10 per page</option>
              <option [value]="20" class="text-gray-900">20 per page</option>
            </select>
          </div>
        </div>

        <div class="mt-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="md:col-span-1">
            <h2 class="text-3xl font-bold text-black mb-6 animate-fade-in">Users</h2>
            <ul class="bg-white border border-gray-200 rounded-lg shadow-md divide-y divide-gray-200">
              <li *ngFor="let user of getUniqueUsers()"
                  (click)="selectUser(user)"
                  [class.selected]="user === selectedUser"
                  class="px-6 py-4 cursor-pointer text-gray-900 hover:bg-gray-50 transition-all duration-200">
                {{user}}
              </li>
            </ul>
          </div>
          <div class="md:col-span-3">
            <h2 class="text-3xl font-bold text-black mb-6 animate-fade-in">{{selectedUser}}'s Workout Progress</h2>
            <div class="bg-white border border-gray-200 rounded-lg shadow-md p-6">
              <canvas id="chartCanvas" class="w-full h-96"></canvas>
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