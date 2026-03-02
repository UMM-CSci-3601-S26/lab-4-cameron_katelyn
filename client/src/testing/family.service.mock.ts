import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { Family } from '../app/family/family';
import { FamilyService } from 'src/app/family/family.service';

/**
 * A "mock" version of the `FamilyService` that can be used to test components
 * without having to create an actual service. It needs to be `Injectable` since
 * that's how services are typically provided to components.
 */
@Injectable({
  providedIn: AppComponent
})
export class MockFamilyService implements Pick<FamilyService, 'getFamilyById' | 'addFamily'> {
  //'getFamily' |
  getFamilies: FamilyService;
  static testFamilies: Family[] = [
    {
      //family with one kid
      _id: 'john_id',
      guardianName: 'John Johnson',
      email: 'jjohnson@email.com',
      address: '713 Broadway',
      timeSlot: '8:00-9:00',
      students: [
        {
          name: 'John Jr.',
          grade: '1',
          school: "Morris Elementary",
          requestedSupplies: ['pencils', 'markers']
        },
      ]
    },
    {
      //family with two kids
      _id: 'jane_id',
      guardianName: 'Jane Doe',
      email: 'janedoe@email.com',
      address: '123 Street',
      timeSlot: '10:00-11:00',
      students: [
        {
          name: 'Jennifer',
          grade: '6',
          school: "Hancock Middle School",
          requestedSupplies: ['headphones']
        },
        {
          name: 'Jake',
          grade: '8',
          school: "Hancock Middle School",
          requestedSupplies: ['calculator']
        },
      ]
    },
    {
      //family with three kids
      _id: 'george_id',
      guardianName: 'George Peterson',
      email: 'georgepeter@email.com',
      address: '245 Acorn Way',
      timeSlot: '1:00-2:00',
      students: [
        {
          name: 'Harold',
          grade: '11',
          school: "Morris High School",
          requestedSupplies: []
        },
        {
          name: 'Thomas',
          grade: '6',
          school: "Morris High School",
          requestedSupplies: ['headphones']
        },
        {
          name: 'Emma',
          grade: '2',
          school: "Morris Elementary",
          requestedSupplies: ['backpack', 'markers']
        },
      ]
    },
  ];

  // // skipcq: JS-0105
  // // It's OK that the `_filters` argument isn't used here, so we'll disable
  // // this warning for just his function.
  // /* eslint-disable @typescript-eslint/no-unused-vars */
  // getFamilies(_filters: { age?: number; company?: string }): Observable<Family[]> {
  //   // Our goal here isn't to test (and thus rewrite) the service, so we'll
  //   // keep it simple and just return the test families regardless of what
  //   // filters are passed in.
  //   //
  //   // The `of()` function converts a regular object or value into an
  //   // `Observable` of that object or value.
  //   return of(MockFamilyService.testFamilies);
  // }

  // skipcq: JS-0105
  getFamilyById(id: string): Observable<Family> {
    // If the specified ID is for one of the first two test families,
    // return that family, otherwise return `null` so
    // we can test illegal family requests.
    // If you need more, just add those in too.
    if (id === MockFamilyService.testFamilies[0]._id) {
      return of(MockFamilyService.testFamilies[0]);
    } else if (id === MockFamilyService.testFamilies[1]._id) {
      return of(MockFamilyService.testFamilies[1]);
    } else {
      return of(null);
    }
  }

  addFamily(newFamily: Partial<Family>): Observable<string> {
    // Send post request to add a new family with the family data as the body.
    // `res.id` should be the MongoDB ID of the newly added `Family`.
    return of('')
  }

  // filterFamilies(families: Family[], filters: {
  //   name?: string;
  //   company?: string;
  // }): Family[] {
  //   return []
  // }
}
