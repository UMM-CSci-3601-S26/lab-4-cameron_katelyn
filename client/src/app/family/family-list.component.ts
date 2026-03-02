import { Component, computed, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { catchError, combineLatest, of, switchMap, tap } from 'rxjs';
import { Family } from './family';
import { FamilyCardComponent } from './family-card.component';
import { FamilyService } from './family.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

/**
 * A component that displays a list of families, either as a grid
 * of cards or as a vertical list.
 *
 * The component supports local filtering by name and/or company,
 * and remote filtering (i.e., filtering by the server) by
 * role and/or age. These choices are fairly arbitrary here,
 * but in "real" projects you want to think about where it
 * makes the most sense to do the filtering.
 */
@Component({
  selector: 'app-family-list-component',
  templateUrl: 'family-list.component.html',
  styleUrls: ['./family-list.component.scss'],
  providers: [],
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    FamilyCardComponent,
    MatListModule,
    RouterLink,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
  ],
})
export class FamilyListComponent {
  // familyService the `FamilyService` used to get families from the server
  private familyService = inject(FamilyService);
  // snackBar the `MatSnackBar` used to display feedback
  private snackBar = inject(MatSnackBar);

  familyGuardianName = signal<string | undefined>(undefined);
  familyEmail = signal<string | undefined>(undefined);
  familyAddress = signal<string | undefined>(undefined);
  familyTimeSlot = signal<string | undefined>(undefined);
  familyStudents = signal<string | undefined>(undefined);

  viewType = signal<'card' | 'list'>('card');

  errMsg = signal<string | undefined>(undefined);

  private familyRole$ = toObservable(this.familyRole);
  private familyAge$ = toObservable(this.familyAge);

  // We ultimately `toSignal` this to be able to access it synchronously, but we do all the RXJS operations
  // "inside" the `toSignal()` call processing and transforming the observables there.
  serverFilteredFamilies =
    // This `combineLatest` call takes the most recent values from these two observables (both built from
    // signals as described above) and passes them into the following `.pipe()` call. If either of the
    // `familyRole` or `familyAge` signals change (because their text fields get updated), then that will trigger
    // the corresponding `familyRole$` and/or `familyAge$` observables to change, which will cause `combineLatest()`
    // to send a new pair down the pipe.
    toSignal(
      combineLatest([this.familyRole$, this.familyAge$]).pipe(
        // `switchMap` maps from one observable to another. In this case, we're taking `role` and `age` and passing
        // them as arguments to `familyService.getFamilies()`, which then returns a new observable that contains the
        // results.
        switchMap(([role, age]) =>
          this.familyService.getFamilies({
            role,
            age,
          })
        ),
        // `catchError` is used to handle errors that might occur in the pipeline. In this case `familyService.getFamilies()`
        // can return errors if, for example, the server is down or returns an error. This catches those errors, and
        // sets the `errMsg` signal, which allows error messages to be displayed.
        catchError((err) => {
          if (!(err.error instanceof ErrorEvent)) {
            this.errMsg.set(
              `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`
            );
          }
          this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });
          // `catchError` needs to return the same type. `of` makes an observable of the same type, and makes the array still empty
          return of<Family[]>([]);
        }),
        // Tap allows you to perform side effects if necessary
        tap(() => {
          // A common side effect is printing to the console.
          // You don't want to leave code like this in the
          // production system, but it can be useful in debugging.
          // console.log('Families were filtered on the server')
        })
      )
    );

  // No need for fancy RXJS stuff. We do the fancy RXJS stuff where we call `toSignal`, i.e., up in
  // the definition of `serverFilteredFamilies` above.
  // `computed()` takes the value of one or more signals (`serverFilteredFamilies` in this case) and
  // _computes_ the value of a new signal (`filteredFamilies`). Angular recognizes when any signals
  // in the function passed to `computed()` change, and will then call that function to generate
  // the new value of the computed signal.
  // In this case, whenever `serverFilteredFamilies` changes (e.g., because we change `familyName`), then `filteredFamilies`
  // will be updated by rerunning the function we're passing to `computed()`.
  filteredFamilies = computed(() => {
    const serverFilteredFamilies = this.serverFilteredFamilies();
    return this.familyService.filterFamilies(serverFilteredFamilies, {
      name: this.familyName(),
      company: this.familyCompany(),
    });
  });
}
