// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
// import { provideRouter } from '@angular/router';
// import { Observable } from 'rxjs';
// import { MockFamilyService } from 'src/testing/family.service.mock';
// import { Family } from './family';
// import { FamilyCardComponent } from './family-card.component';
// import { FamilyListComponent } from './family-list.component';
// import { FamilyService } from './family.service';
// import { provideHttpClient } from '@angular/common/http';
// import { provideHttpClientTesting } from '@angular/common/http/testing';

// describe('Family list', () => {
//   let familyList: FamilyListComponent;
//   let fixture: ComponentFixture<FamilyListComponent>;
//   let familyService: FamilyService;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [FamilyListComponent, FamilyCardComponent],
//       providers: [
//         provideHttpClient(),
//         provideHttpClientTesting(),
//         { provide: FamilyService, useClass: MockFamilyService },
//         provideRouter([])
//       ],
//     });
//   });

//   beforeEach(waitForAsync(() => {
//     TestBed.compileComponents().then(() => {
//       fixture = TestBed.createComponent(FamilyListComponent);
//       familyList = fixture.componentInstance;
//       familyService = TestBed.inject(FamilyService);
//       fixture.detectChanges();
//     });
//   }));

//   it('should create the component', () => {
//     expect(familyList).toBeTruthy();
//   });

//   it('should initialize with serverFilteredFamilies available', () => {
//     const families = familyList.serverFilteredFamilies();
//     expect(families).toBeDefined();
//     expect(Array.isArray(families)).toBe(true);
//   });

//   it('should call getFamilies() when familyRole signal changes', () => {
//     const spy = spyOn(familyService, 'getFamilies').and.callThrough();
//     familyList.familyRole.set('admin');
//     fixture.detectChanges();
//     expect(spy).toHaveBeenCalledWith({ role: 'admin', age: undefined });
//   });

//   it('should call getFamilies() when familyAge signal changes', () => {
//     const spy = spyOn(familyService, 'getFamilies').and.callThrough();
//     familyList.familyAge.set(25);
//     fixture.detectChanges();
//     expect(spy).toHaveBeenCalledWith({ role: undefined, age: 25 });
//   });

//   it('should not show error message on successful load', () => {
//     expect(familyList.errMsg()).toBeUndefined();
//   });
// });

// /*
//  * This test is a little odd, but illustrates how we can use stubs
//  * to create mock objects (a service in this case) that be used for
//  * testing. Here we set up the mock FamilyService (familyServiceStub) so that
//  * _always_ fails (throws an exception) when you request a set of families.
//  */
// describe('Misbehaving Family List', () => {
//   let familyList: FamilyListComponent;
//   let fixture: ComponentFixture<FamilyListComponent>;

//   let familyServiceStub: {
//     getFamilies: () => Observable<Family[]>;
//     filterFamilies: () => Family[];
//   };

//   beforeEach(() => {
//     // stub FamilyService for test purposes
//     familyServiceStub = {
//       getFamilies: () =>
//         new Observable((observer) => {
//           observer.error('getFamilies() Observer generates an error');
//         }),
//       filterFamilies: () => []
//     };
//   });

//   // Construct the `familyList` used for the testing in the `it` statement
//   // below.
//   beforeEach(waitForAsync(() => {
//     TestBed.configureTestingModule({
//       imports: [
//         FamilyListComponent
//       ],
//       // providers:    [ FamilyService ]  // NO! Don't provide the real service!
//       // Provide a test-double instead
//       providers: [{
//         provide: FamilyService,
//         useValue: familyServiceStub
//       }, provideRouter([])],
//     })
//       .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(FamilyListComponent);
//     familyList = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it("generates an error if we don't set up a FamilyListService", () => {
//     // If the service fails, we expect the `serverFilteredFamilies` signal to
//     // be an empty array of families.
//     expect(familyList.serverFilteredFamilies())
//       .withContext("service can't give values to the list if it's not there")
//       .toEqual([]);
//     // We also expect the `errMsg` signal to contain the "Problem contacting…"
//     // error message. (It's arguably a bit fragile to expect something specific
//     // like this; maybe we just want to expect it to be non-empty?)
//     expect(familyList.errMsg())
//       .withContext('the error message will be')
//       .toContain('Problem contacting the server – Error Code:');
//   });
// });
