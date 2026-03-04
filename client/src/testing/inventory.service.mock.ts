import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { inventory } from '../app/inventory/inventory';
import { InventoryService } from 'src/app/inventory/inventory.service';

@Injectable({
  providedIn: AppComponent
})
export class MockInventoryService implements Pick<InventoryService, 'getInventoryById' | 'addInventory' | 'getDashboardStats'> {
  //'getInventory' |
  // getFamilies: InventoryService;
  static testFamilies: inventory[] = [
    {
      //inventory with one kid
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
      //inventory with two kids
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
      //inventory with three kids
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

  getDashboardStats() {
    const studentsPerSchool: { [school: string]: number } = {};
    const studentsPerGrade: { [grade: string]: number } = {};

    MockInventoryService.testFamilies.forEach(inventory => {
      inventory.students.forEach(student => {
        studentsPerSchool[student.school] =
        (studentsPerSchool[student.school] ?? 0) + 1;

        studentsPerGrade[student.grade] =
        (studentsPerGrade[student.grade] ?? 0) + 1;
      });
    });

    return of([
      {
        studentsPerSchool,
        studentsPerGrade,
        totalFamilies: MockInventoryService.testFamilies.length
      }
    ]);
  }

  getFamilies(): Observable<Inventory[]> {
    return of(MockInventoryService.testFamilies);
  }

  getInventoryById(id: string): Observable<Inventory> {
    if (id === MockInventoryService.testFamilies[0]._id) {
      return of(MockInventoryService.testFamilies[0]);
    } else if (id === MockInventoryService.testFamilies[1]._id) {
      return of(MockInventoryService.testFamilies[1]);
    } else {
      return of(null);
    }
  }

  addInventory(newInventory: Partial<Inventory>): Observable<string> {
    return of('1');
  }

  deleteInventory(id: string): Observable<string> {
    return of('1');
  }

  exportFamilies(): Observable<string> {
    return of('csv-data');
  }
}
