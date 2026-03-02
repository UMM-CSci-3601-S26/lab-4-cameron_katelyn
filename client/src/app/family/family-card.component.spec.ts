// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
// import { FamilyCardComponent } from './family-card.component';
// import { Family } from './family';

// describe('FamilyCardComponent', () => {
//   let component: FamilyCardComponent;
//   let fixture: ComponentFixture<FamilyCardComponent>;
//   let expectedFamily: Family;

//   beforeEach(waitForAsync(() => {
//     TestBed.configureTestingModule({
//       imports: [
//         FamilyCardComponent
//       ]
//     })
//       .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(FamilyCardComponent);
//     component = fixture.componentInstance;
//     expectedFamily = {
//       _id: 'chris_id',
//       name: 'Chris',
//       age: 25,
//       company: 'UMM',
//       email: 'chris@this.that',
//       role: 'admin',
//       avatar: 'https://gravatar.com/avatar/8c9616d6cc5de638ea6920fb5d65fc6c?d=identicon'
//     };
//     fixture.componentRef.setInput('family', expectedFamily);
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should be associated with the correct family', () => {
//     expect(component.family()).toEqual(expectedFamily);
//   });

//   it('should be the family named Chris', () => {
//     expect(component.family().name).toEqual('Chris');
//   });
// });
