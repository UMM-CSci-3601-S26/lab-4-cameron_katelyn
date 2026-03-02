import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
//import { FamilyRole } from './family';
import { FamilyService } from './family.service';

@Component({
  selector: 'app-add-family',
  templateUrl: './add-family.component.html',
  styleUrls: ['./add-family.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatButtonModule]
})
export class AddFamilyComponent {
  private familyService = inject(FamilyService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);


  addFamilyForm = new FormGroup({
    // We allow alphanumeric input and limit the length for name.
    name: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(2),
      // In the real world you'd want to be very careful about having
      // an upper limit like this because people can sometimes have
      // very long names. This demonstrates that it's possible, though,
      // to have maximum length limits.
      Validators.maxLength(50),
      (fc) => {
        if (fc.value.toLowerCase() === 'abc123' || fc.value.toLowerCase() === '123abc') {
          return ({existingName: true});
        } else {
          return null;
        }
      },
    ])),

    // Since this is for a company, we need workers to be old enough to work, and probably not older than 200.
    age: new FormControl<number>(null, Validators.compose([
      Validators.required,
      Validators.min(15),
      Validators.max(200),
      // In the HTML, we set type="number" on this field. That guarantees that the value of this field is numeric,
      // but not that it's a whole number. (The family could still type -27.3232, for example.) So, we also need
      // to include this pattern.
      Validators.pattern('^[0-9]+$')
    ])),

    // We don't care much about what is in the company field, so we just add it here as part of the form
    // without any particular validation.
    company: new FormControl(''),

    // We don't need a special validator just for our app here, but there is a default one for email.
    // We will require the email, though.
    email: new FormControl('', Validators.compose([
      Validators.required,
      Validators.email,
    ])),

    // role: new FormControl<FamilyRole>('viewer', Validators.compose([
    //   Validators.required,
    //   Validators.pattern('^(admin|editor|viewer)$'),
    // ])),
  });


  // We can only display one error at a time,
  // the order the messages are defined in is the order they will display in.
  readonly addFamilyValidationMessages = {
    guardianName: [
      {type: 'required', message: 'GuardianName is required'},
      {type: 'minlength', message: 'GuardianName must be at least 2 characters long'},
      {type: 'maxlength', message: 'GuardianName cannot be more than 50 characters long'},
      {type: 'existingName', message: 'GuardianName has already been taken'}
    ],

    email: [
      {type: 'email', message: 'Email must be formatted properly'},
      {type: 'required', message: 'Email is required'}
    ],

    address: [
      {type: 'required', message: 'Address is required'},
      //{type: 'min', message: 'Age must be at least 15'},
      //{type: 'max', message: 'Age may not be greater than 200'},
      //{type: 'pattern', message: 'Age must be a whole number'}
    ],

    timeSlot: [
      { type: 'required', message: 'TimeSlot is required' },
      //{ type: 'pattern', message: 'Role must be Admin, Editor, or Viewer' },
    ],

    students: {
      name: [
        { type: 'required', message: 'Name is required' },
        { type: 'minlength', message: 'Student name must be at least 2 characters long' }
      ],
      grade: [
        { type: 'required', message: 'Grade is required' }
      ],
      school: [
        { type: 'required', message: 'School is required' }
      ]
    }
  };

  formControlHasError(controlName: string): boolean {
    return this.addFamilyForm.get(controlName).invalid &&
      (this.addFamilyForm.get(controlName).dirty || this.addFamilyForm.get(controlName).touched);
  }

  getErrorMessage(controlName: keyof typeof this.addFamilyValidationMessages): string {
    const messages = this.addFamilyValidationMessages[controlName];
    if (!Array.isArray(messages)) {
      return ''; // either throws or ignores
    }
    for (const { type, message } of messages) {
      if (this.addFamilyForm.get(controlName)?.hasError(type)) {
        return message;

      }
    }
    return 'Unknown error';
  }

  submitForm() {
    this.familyService.addFamily(this.addFamilyForm.value).subscribe({
      next: (newId) => {
        this.snackBar.open(
          `Added family ${this.addFamilyForm.value.name}`,
          null,
          { duration: 2000 }
        );
        this.router.navigate(['/families/', newId]);
      },
      error: err => {
        if (err.status === 400) {
          this.snackBar.open(
            `Tried to add an illegal new family – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        } else if (err.status === 500) {
          this.snackBar.open(
            `The server failed to process your request to add a new family. Is the server up? – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        } else {
          this.snackBar.open(
            `An unexpected error occurred – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        }
      },
    });
  }

}
