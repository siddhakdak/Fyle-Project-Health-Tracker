import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { WorkoutTrackerComponent } from './workout-tracker.component';
import { WorkoutService } from '../../services/workout.service';
import { WorkoutEntry } from '../../models/entry.models';

describe('WorkoutTrackerComponent', () => {
  let component: WorkoutTrackerComponent;
  let fixture: ComponentFixture<WorkoutTrackerComponent>;
  let workoutService: jasmine.SpyObj<WorkoutService>;

  beforeEach(async () => {
    const workoutServiceSpy = jasmine.createSpyObj('WorkoutService', [
      'getWorkoutEntries',
      'addWorkoutEntry',
      'deleteWorkoutEntry',
    ]);

    await TestBed.configureTestingModule({
      declarations: [WorkoutTrackerComponent],
      imports: [FormsModule],
      providers: [{ provide: WorkoutService, useValue: workoutServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutTrackerComponent);
    component = fixture.componentInstance;
    workoutService = TestBed.inject(WorkoutService) as jasmine.SpyObj<WorkoutService>;

    workoutService.getWorkoutEntries.and.returnValue([
      { id: '1', userName: 'John Doe', workoutType: 'Running', workoutMinutes: 30 },
      { id: '2', userName: 'Jane Smith', workoutType: 'Swimming', workoutMinutes: 60 },
    ]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load workout entries on init', () => {
    fixture.detectChanges();
    expect(component.workoutEntries.length).toBe(2);
    expect(workoutService.getWorkoutEntries).toHaveBeenCalled();
  });

  it('should add a workout entry', () => {
    const newEntry: Omit<WorkoutEntry, 'id'> = {
      userName: 'Test User',
      workoutType: 'Cycling',
      workoutMinutes: 45,
    };

    component.userName = newEntry.userName;
    component.workoutType = newEntry.workoutType;
    component.workoutMinutes = newEntry.workoutMinutes;

    const mockForm = { valid: true, resetForm: jasmine.createSpy('resetForm') };

    
    component.onSubmit(mockForm as any);

    expect(workoutService.addWorkoutEntry).toHaveBeenCalledWith(newEntry);
    expect(mockForm.resetForm).toHaveBeenCalled();
  });

  it('should filter workout entries', () => {
    component.workoutEntries = [
      { id: '1', userName: 'John Doe', workoutType: 'Running', workoutMinutes: 30 },
      { id: '2', userName: 'Jane Smith', workoutType: 'Swimming', workoutMinutes: 60 },
    ];

    component.searchTerm = 'John';
    fixture.detectChanges();
    component.applyFilters();

    expect(component.filteredEntries.length).toBe(1);
    expect(component.filteredEntries[0].userName).toBe('John Doe');
  });
});
