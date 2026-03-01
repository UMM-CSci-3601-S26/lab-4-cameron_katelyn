package umm3601.family;

// import static com.mongodb.client.model.Filters.eq;
// import static org.junit.jupiter.api.Assertions.assertEquals;
// import static org.junit.jupiter.api.Assertions.assertNotEquals;
// import static org.junit.jupiter.api.Assertions.assertNotNull;
// import static org.junit.jupiter.api.Assertions.assertThrows;
// import static org.junit.jupiter.api.Assertions.assertTrue;
// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.ArgumentMatchers.argThat;
// import static org.mockito.Mockito.mock;
// import static org.mockito.Mockito.verify;
// import static org.mockito.Mockito.when;

import java.io.IOException;
// import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
// import java.util.Collections;
// import java.util.HashMap;
import java.util.List;
import java.util.Map;
// import java.util.stream.Collectors;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
// import org.mockito.ArgumentMatcher;
import org.mockito.Captor;
import org.mockito.Mock;
// import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

// import com.fasterxml.jackson.core.JsonProcessingException;
// import com.fasterxml.jackson.databind.JsonMappingException;
import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

// import io.javalin.Javalin;
// import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
// import io.javalin.http.HttpStatus;
// import io.javalin.http.NotFoundResponse;
import io.javalin.json.JavalinJackson;
// import io.javalin.validation.BodyValidator;
// import io.javalin.validation.Validation;
// import io.javalin.validation.ValidationError;
// import io.javalin.validation.ValidationException;
// import io.javalin.validation.Validator;

/**
 * Tests the logic of the FamilyController
 *
 * @throws IOException
 */
// The tests here include a ton of "magic numbers" (numeric constants).
// It wasn't clear to me that giving all of them names would actually
// help things. The fact that it wasn't obvious what to call some
// of them says a lot. Maybe what this ultimately means is that
// these tests can/should be restructured so the constants (there are
// also a lot of "magic strings" that Checkstyle doesn't actually
// flag as a problem) make more sense.
@SuppressWarnings({ "MagicNumber" })
class FamilyControllerSpec {

  // An instance of the controller we're testing that is prepared in
  // `setupEach()`, and then exercised in the various tests below.
  private FamilyController familyController;

  // A Mongo object ID that is initialized in `setupEach()` and used
  // in a few of the tests. It isn't used all that often, though,
  // which suggests that maybe we should extract the tests that
  // care about it into their own spec file?
  private ObjectId johnsFamilyId;

  // The client and database that will be used
  // for all the tests in this spec file.
  private static MongoClient mongoClient;
  private static MongoDatabase db;

  // Used to translate between JSON and POJOs.
  @SuppressWarnings("unused")
  private static JavalinJackson javalinJackson = new JavalinJackson();

  @Mock
  private Context ctx;

  @Captor
  private ArgumentCaptor<ArrayList<Family>> familyArrayListCaptor;
  private ArgumentCaptor<Family> familyCaptor;

  @SuppressWarnings("unused")
  private ArgumentCaptor<Map<String, String>> mapCaptor;

  /**
   * Sets up (the connection to the) DB once; that connection and DB will
   * then be (re)used for all the tests, and closed in the `teardown()`
   * method. It's somewhat expensive to establish a connection to the
   * database, and there are usually limits to how many connections
   * a database will support at once. Limiting ourselves to a single
   * connection that will be shared across all the tests in this spec
   * file helps both speed things up and reduce the load on the DB
   * engine.
   */
  @BeforeAll
  static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
        MongoClientSettings.builder()
            .applyToClusterSettings(builder -> builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
            .build());
    db = mongoClient.getDatabase("test");
  }

  @AfterAll
  static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @BeforeEach
  void setupEach() throws IOException {
    // Reset our mock context and argument captor (declared with Mockito
    // annotations @Mock and @Captor)
    MockitoAnnotations.openMocks(this);

    // Setup database
    MongoCollection<Document> familyDocuments = db.getCollection("families");
    familyDocuments.drop();
    List<Document> testFamilies = new ArrayList<>();

    //1st Family - 3 kids
    Document student1 = new Document()
      .append("name", "Alice")
      .append("grade", "3")
      .append("school", "MAHS")
      .append("requestedSupplies", List.of("headphones"));
    Document student2 = new Document()
      .append("name", "Timmy")
      .append("grade", "5")
      .append("school", "MAHS")
      .append("requestedSupplies", List.of("headphones"));
    Document student3 = new Document()
      .append("name", "Sara")
      .append("grade", "7")
      .append("school", "MAHS")
      .append("requestedSupplies", List.of("backpack","headphones"));

    Document family1 = new Document()
      .append("_id","238829384928374")
      .append("guardianName", "Jane Doe")
      .append("email", "jane@email.com")
      .append("address", "123 Street")
      .append("timeSlot", "10:00-11:00")
      .append("students", List.of(student1))
      .append("students", List.of(student2))
      .append("students", List.of(student3));
      //not entirely sure if this works yet but the following had errors:
      //.append("students", List.of(student1, student2, student3);

    //2nd Family - 1 kid
    Document student4 = new Document()
      .append("name", "Ronan")
      .append("grade", "4")
      .append("school", "HHS")
      .append("requestedSupplies", List.of());

    Document family2 = new Document()
      .append("_id","238829384928374")
      .append("guardianName", "John Christensen")
      .append("email", "jchristensen@email.com")
      .append("address", "713 Broadway")
      .append("timeSlot", "8:00-9:00")
      .append("students", List.of(student4));
      //why can't I append more than one student at a time?

    // //3rd Family - 2 kids
    // Document student5 = new Document()
    //   .append("name", "Lilian")
    //   .append("grade", "1")
    //   .append("school", "HHS")
    //   .append("requestedSupplies", List.of("backpack"));
    // Document student6 = new Document()
    //   .append("name", "Oliver")
    //   .append("grade", "9")
    //   .append("school", "MAHS")
    //   .append("requestedSupplies", List.of("headphones"));

    // Document family3 = new Document()
    //   .append("_id","238829384928374")
    //   .append("guardianName", "John Johnson")
    //   .append("email", "jjohnson@email.com")
    //   .append("address", "456 Avenue")
    //   .append("timeSlot", "2:00-3:00")
    //   .append("students", List.of(student5))
    //   .append("students", List.of(student6));



    johnsFamilyId = new ObjectId();
    Document student7 = new Document()
       .append("name", "Lilian")
       .append("grade", "1")
       .append("school", "HHS")
       .append("requestedSupplies", List.of("backpack"));

    Document john = new Document()
        .append("_id", johnsFamilyId)
        .append("guardianName", "John Johnson")
        .append("email", "jjohnson@email.com")
        .append("address", "456 Avenue")
        .append("timeSlot", "2:00-3:00")
        .append("students", List.of(student7));

    testFamilies.add(family1);
    testFamilies.add(family2);
    //testFamilies.add(family3);

    familyDocuments.insertMany(testFamilies);
    familyDocuments.insertOne(john);

    familyController = new FamilyController(db);
  }

  // @Test
  // void addsRoutes() {
  //   Javalin mockServer = mock(Javalin.class);
  //   familyController.addRoutes(mockServer);
  //   verify(mockServer, Mockito.atLeast(3)).get(any(), any());
  //   verify(mockServer, Mockito.atLeastOnce()).post(any(), any());
  //   verify(mockServer, Mockito.atLeastOnce()).delete(any(), any());
  // }

  // @Test
  // void canGetAllFamilies() throws IOException {
  //   // When something asks the (mocked) context for the queryParamMap,
  //   // it will return an empty map (since there are no query params in
  //   // this case where we want all families).
  //   when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());

  //   // Now, go ahead and ask the familyController to getFamilies
  //   // (which will, indeed, ask the context for its queryParamMap)
  //   familyController.getFamilies(ctx);

  //   // We are going to capture an argument to a function, and the type of
  //   // that argument will be of type ArrayList<Family> (we said so earlier
  //   // using a Mockito annotation like this):
  //   // @Captor
  //   // private ArgumentCaptor<ArrayList<Family>> familyArrayListCaptor;
  //   // We only want to declare that captor once and let the annotation
  //   // help us accomplish reassignment of the value for the captor
  //   // We reset the values of our annotated declarations using the command
  //   // `MockitoAnnotations.openMocks(this);` in our @BeforeEach

  //   // Specifically, we want to pay attention to the ArrayList<Family> that
  //   // is passed as input when ctx.json is called --- what is the argument
  //   // that was passed? We capture it and can refer to it later.
  //   verify(ctx).json(familyArrayListCaptor.capture());
  //   verify(ctx).status(HttpStatus.OK);

  //   // Check that the database collection holds the same number of documents
  //   // as the size of the captured List<Family>
  //   assertEquals(
  //       db.getCollection("families").countDocuments(),
  //       familyArrayListCaptor.getValue().size());
  // }


  //following is commented out because we haven't established filtering quite yet

  // @Test
  // void canGetFamiliesWithCompany() throws IOException {
  //   Map<String, List<String>> queryParams = new HashMap<>();
  //   queryParams.put(FamilyController.COMPANY_KEY, Arrays.asList(new String[] {"OHMNET"}));
  //   queryParams.put(FamilyController.SORT_ORDER_KEY, Arrays.asList(new String[] {"desc"}));
  //   when(ctx.queryParamMap()).thenReturn(queryParams);
  //   when(ctx.queryParam(FamilyController.COMPANY_KEY)).thenReturn("OHMNET");
  //   when(ctx.queryParam(FamilyController.SORT_ORDER_KEY)).thenReturn("desc");

  //   familyController.getFamilies(ctx);

  //   verify(ctx).json(familyArrayListCaptor.capture());
  //   verify(ctx).status(HttpStatus.OK);

  //   // Confirm that all the families passed to `json` work for OHMNET.
  //   for (Family family : familyArrayListCaptor.getValue()) {
  //     assertEquals("OHMNET", family.company);
  //   }
  // }

  // @Test
  // void canGetFamiliesWithCompanyLowercase() throws IOException {
  //   Map<String, List<String>> queryParams = new HashMap<>();
  //   queryParams.put(FamilyController.COMPANY_KEY, Arrays.asList(new String[] {"ohm"}));
  //   when(ctx.queryParamMap()).thenReturn(queryParams);
  //   when(ctx.queryParam(FamilyController.COMPANY_KEY)).thenReturn("ohm");

  //   familyController.getFamilies(ctx);

  //   verify(ctx).json(familyArrayListCaptor.capture());
  //   verify(ctx).status(HttpStatus.OK);

  //   // Confirm that all the families passed to `json` work for OHMNET.
  //   for (Family family : familyArrayListCaptor.getValue()) {
  //     assertEquals("OHMNET", family.company);
  //   }
  // }

  // @Test
  // void getFamiliesByRole() throws IOException {
  //   Map<String, List<String>> queryParams = new HashMap<>();
  //   String roleString = "viewer";
  //   queryParams.put(FamilyController.ROLE_KEY, Arrays.asList(new String[] {roleString}));
  //   when(ctx.queryParamMap()).thenReturn(queryParams);

  //   // Create a validator that confirms that when we ask for the value associated with
  //   // `ROLE_KEY` we get back a string that represents a legal role.
  //   Validation validation = new Validation();
  //   Validator<String> validator = validation.validator(FamilyController.ROLE_KEY, String.class, roleString);
  //   when(ctx.queryParamAsClass(FamilyController.ROLE_KEY, String.class)).thenReturn(validator);

  //   familyController.getFamilies(ctx);

  //   verify(ctx).json(familyArrayListCaptor.capture());
  //   verify(ctx).status(HttpStatus.OK);
  //   assertEquals(2, familyArrayListCaptor.getValue().size());
  // }

  // @Test
  // void getFamiliesByCompanyAndAge() throws IOException {
  //   String targetCompanyString = "OHMNET";
  //   Integer targetAge = 37;
  //   String targetAgeString = targetAge.toString();

  //   Map<String, List<String>> queryParams = new HashMap<>();
  //   queryParams.put(FamilyController.COMPANY_KEY, Arrays.asList(new String[] {targetCompanyString}));
  //   queryParams.put(FamilyController.AGE_KEY, Arrays.asList(new String[] {targetAgeString}));
  //   when(ctx.queryParamMap()).thenReturn(queryParams);
  //   when(ctx.queryParam(FamilyController.COMPANY_KEY)).thenReturn(targetCompanyString);

  //   // Create a validator that confirms that when we ask for the value associated with
  //   // `AGE_KEY` _as an integer_, we get back the integer value 37.
  //   Validation validation = new Validation();
  //   Validator<Integer> validator = validation.validator(FamilyController.AGE_KEY, Integer.class, targetAgeString);
  //   when(ctx.queryParamAsClass(FamilyController.AGE_KEY, Integer.class)).thenReturn(validator);
  //   when(ctx.queryParam(FamilyController.AGE_KEY)).thenReturn(targetAgeString);

  //   familyController.getFamilies(ctx);

  //   verify(ctx).json(familyArrayListCaptor.capture());
  //   verify(ctx).status(HttpStatus.OK);
  //   assertEquals(1, familyArrayListCaptor.getValue().size());
  //   for (Family family : familyArrayListCaptor.getValue()) {
  //     assertEquals(targetCompanyString, family.company);
  //     assertEquals(targetAge, family.age);
  //   }
  // }




  // @Test
  // void getFamilyWithExistentId() throws IOException {
  //   String id = johnsFamilyId.toHexString();
  //   when(ctx.pathParam("id")).thenReturn(id);

  //   familyController.getFamily(ctx);

  //   verify(ctx).json(familyCaptor.capture());
  //   verify(ctx).status(HttpStatus.OK);
  //   assertEquals("John Johnson", familyCaptor.getValue().guardianName);
  //   assertEquals(johnsFamilyId.toHexString(), familyCaptor.getValue()._id);
  // }

  // @Test
  // void getFamilyWithBadId() throws IOException {
  //   when(ctx.pathParam("id")).thenReturn("bad");

  //   Throwable exception = assertThrows(BadRequestResponse.class, () -> {
  //     familyController.getFamily(ctx);
  //   });

  //   assertEquals("The requested family id wasn't a legal Mongo Object ID.", exception.getMessage());
  // }

  // @Test
  // void getFamilyWithNonexistentId() throws IOException {
  //   String id = "588935f5c668650dc77df581";
  //   when(ctx.pathParam("id")).thenReturn(id);

  //   Throwable exception = assertThrows(NotFoundResponse.class, () -> {
  //     familyController.getFamily(ctx);
  //   });

  //   assertEquals("The requested family was not found", exception.getMessage());
  // }





  // @Captor
  // private ArgumentCaptor<ArrayList<FamilyByCompany>> familyByCompanyListCaptor;

  // @Test
  // void testGetFamiliesGroupedByCompany() {
  //   when(ctx.queryParam("sortBy")).thenReturn("company");
  //   when(ctx.queryParam("sortOrder")).thenReturn("asc");
  //   familyController.getFamiliesGroupedByCompany(ctx);

  //   // Capture the argument to `ctx.json()`
  //   verify(ctx).json(familyByCompanyListCaptor.capture());

  //   // Get the value that was passed to `ctx.json()`
  //   ArrayList<FamilyByCompany> result = familyByCompanyListCaptor.getValue();

  //   // There are 3 companies in the test data, so we should have 3 entries in the
  //   // result.
  //   assertEquals(3, result.size());

  //   // The companies should be in alphabetical order by company name,
  //   // and with family counts of 1, 2, and 1, respectively.
  //   FamilyByCompany ibm = result.get(0);
  //   assertEquals("IBM", ibm._id);
  //   assertEquals(1, ibm.count);
  //   FamilyByCompany ohmnet = result.get(1);
  //   assertEquals("OHMNET", ohmnet._id);
  //   assertEquals(2, ohmnet.count);
  //   FamilyByCompany umm = result.get(2);
  //   assertEquals("UMM", umm._id);
  //   assertEquals(1, umm.count);

  //   // The families for OHMNET should be Jamie and Sam, although we don't
  //   // know what order they'll be in.
  //   assertEquals(2, ohmnet.families.size());
  //   assertTrue(ohmnet.families.get(0).name.equals("Jamie") || ohmnet.families.get(0).name.equals("Sam"),
  //       "First family should have name 'Jamie' or 'Sam'");
  //   assertTrue(ohmnet.families.get(1).name.equals("Jamie") || ohmnet.families.get(1).name.equals("Sam"),
  //       "Second family should have name 'Jamie' or 'Sam'");
  // }

  // @Test
  // void testGetFamiliesGroupedByCompanyDescending() {
  //   when(ctx.queryParam("sortBy")).thenReturn("company");
  //   when(ctx.queryParam("sortOrder")).thenReturn("desc");
  //   familyController.getFamiliesGroupedByCompany(ctx);

  //   // Capture the argument to `ctx.json()`
  //   verify(ctx).json(familyByCompanyListCaptor.capture());

  //   // Get the value that was passed to `ctx.json()`
  //   ArrayList<FamilyByCompany> result = familyByCompanyListCaptor.getValue();

  //   // There are 3 companies in the test data, so we should have 3 entries in the
  //   // result.
  //   assertEquals(3, result.size());

  //   // The companies should be in reverse alphabetical order by company name,
  //   // and with family counts of 1, 2, and 1, respectively.
  //   FamilyByCompany umm = result.get(0);
  //   assertEquals("UMM", umm._id);
  //   assertEquals(1, umm.count);
  //   FamilyByCompany ohmnet = result.get(1);
  //   assertEquals("OHMNET", ohmnet._id);
  //   assertEquals(2, ohmnet.count);
  //   FamilyByCompany ibm = result.get(2);
  //   assertEquals("IBM", ibm._id);
  //   assertEquals(1, ibm.count);
  // }

  // @Test
  // void testGetFamiliesGroupedByCompanyOrderedByCount() {
  //   when(ctx.queryParam("sortBy")).thenReturn("count");
  //   when(ctx.queryParam("sortOrder")).thenReturn("asc");
  //   familyController.getFamiliesGroupedByCompany(ctx);

  //   // Capture the argument to `ctx.json()`
  //   verify(ctx).json(familyByCompanyListCaptor.capture());

  //   // Get the value that was passed to `ctx.json()`
  //   ArrayList<FamilyByCompany> result = familyByCompanyListCaptor.getValue();

  //   // There are 3 companies in the test data, so we should have 3 entries in the
  //   // result.
  //   assertEquals(3, result.size());

  //   // The companies should be in order by family count, and with counts of 1, 1, and
  //   // 2,
  //   // respectively. We don't know which order "IBM" and "UMM" will be in, since
  //   // they
  //   // both have a count of 1. So we'll get them both and then swap them if
  //   // necessary.
  //   FamilyByCompany ibm = result.get(0);
  //   FamilyByCompany umm = result.get(1);
  //   if (ibm._id.equals("UMM")) {
  //     umm = result.get(0);
  //     ibm = result.get(1);
  //   }
  //   FamilyByCompany ohmnet = result.get(2);
  //   assertEquals("IBM", ibm._id);
  //   assertEquals(1, ibm.count);
  //   assertEquals("UMM", umm._id);
  //   assertEquals(1, umm.count);
  //   assertEquals("OHMNET", ohmnet._id);
  //   assertEquals(2, ohmnet.count);
  // }



  //have not implemented addFamily functions at this time:

  // @Test
  // void addFamily() throws IOException {
  //   // Create a new family to add
  //   Family newFamily = new Family();
  //   newFamily.name = "Test Family";
  //   newFamily.age = 25;
  //   newFamily.company = "testers";
  //   newFamily.email = "test@example.com";
  //   newFamily.role = "viewer";

  //   // Use `javalinJackson` to convert the `Family` object to a JSON string representing that family.
  //   // This would be equivalent to:
  //   //   String testNewFamily = """
  //   //       {
  //   //         "name": "Test Family",
  //   //         "age": 25,
  //   //         "company": "testers",
  //   //         "email": "test@example.com",
  //   //         "role": "viewer"
  //   //       }
  //   //       """;
  //   // but using `javalinJackson` to generate the JSON avoids repeating all the field values,
  //   // which is then less error prone.
  //   String newFamilyJson = javalinJackson.toJsonString(newFamily, Family.class);

  //   // A `BodyValidator` needs
  //   //   - The string (`newFamilyJson`) being validated
  //   //   - The class (`Family.class) it's trying to generate from that string
  //   //   - A function (`() -> Family`) which "shows" the validator how to convert
  //   //     the JSON string to a `Family` object. We'll again use `javalinJackson`,
  //   //     but in the other direction.
  //   when(ctx.bodyValidator(Family.class))
  //     .thenReturn(new BodyValidator<Family>(newFamilyJson, Family.class,
  //                   () -> javalinJackson.fromJsonString(newFamilyJson, Family.class)));

  //   familyController.addNewFamily(ctx);
  //   verify(ctx).json(mapCaptor.capture());

  //   // Our status should be 201, i.e., our new family was successfully created.
  //   verify(ctx).status(HttpStatus.CREATED);

  //   // Verify that the family was added to the database with the correct ID
  //   Document addedFamily = db.getCollection("families")
  //       .find(eq("_id", new ObjectId(mapCaptor.getValue().get("id")))).first();

  //   // Successfully adding the family should return the newly generated, non-empty
  //   // MongoDB ID for that family.
  //   assertNotEquals("", addedFamily.get("_id"));
  //   // The new family in the database (`addedFamily`) should have the same
  //   // field values as the family we asked it to add (`newFamily`).
  //   assertEquals(newFamily.name, addedFamily.get("name"));
  //   assertEquals(newFamily.age, addedFamily.get(FamilyController.AGE_KEY));
  //   assertEquals(newFamily.company, addedFamily.get(FamilyController.COMPANY_KEY));
  //   assertEquals(newFamily.email, addedFamily.get("email"));
  //   assertEquals(newFamily.role, addedFamily.get(FamilyController.ROLE_KEY));
  //   assertNotNull(addedFamily.get("avatar"));
  // }

  // @Test
  // void addInvalidEmailFamily() throws IOException {
  //   // Create a new family JSON string to add.
  //   // Note that it has an invalid string for the email address, which is
  //   // why we're using a `String` here instead of a `Family` object
  //   // like we did in the previous tests.
  //   String newFamilyJson = """
  //     {
  //       "name": "Test Family",
  //       "age": 25,
  //       "company": "testers",
  //       "email": "invalidemail",
  //       "role": "viewer"
  //     }
  //     """;

  //   when(ctx.body()).thenReturn(newFamilyJson);
  //   when(ctx.bodyValidator(Family.class))
  //     .thenReturn(new BodyValidator<Family>(newFamilyJson, Family.class,
  //                   () -> javalinJackson.fromJsonString(newFamilyJson, Family.class)));

  //   // This should now throw a `ValidationException` because
  //   // the JSON for our new family has an invalid email address.
  //   ValidationException exception = assertThrows(ValidationException.class, () -> {
  //     familyController.addNewFamily(ctx);
  //   });

  //   // This `ValidationException` was caused by a custom check, so we just get the message from the first
  //   // error (which is a `"REQUEST_BODY"` error) and convert that to a string with `toString()`. This gives
  //   // a `String` that has all the details of the exception, which we can make sure contains information
  //   // that would help a developer sort out validation errors.
  //   String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();

  //   // The message should be the message from our code under test, which should also include the text
  //   // we tried to parse as an email, namely "invalidemail".
  //   assertTrue(exceptionMessage.contains("invalidemail"));
  // }

  // @Test
  // void addInvalidAgeFamily() throws IOException {
  //   // Create a new family JSON string to add.
  //   // Note that it has a string for the age that can't be parsed to a number.
  //   String newFamilyJson = """
  //     {
  //       "name": "Test Family",
  //       "age": "notanumber",
  //       "company": "testers",
  //       "email": "test@example.com",
  //       "role": "viewer"
  //     }
  //     """;

  //   when(ctx.body()).thenReturn(newFamilyJson);
  //   when(ctx.bodyValidator(Family.class))
  //       .thenReturn(new BodyValidator<Family>(newFamilyJson, Family.class,
  //                     () -> javalinJackson.fromJsonString(newFamilyJson, Family.class)));

  //   // This should now throw a `ValidationException` because
  //   // the JSON for our new family has an invalid email address.
  //   ValidationException exception = assertThrows(ValidationException.class, () -> {
  //     familyController.addNewFamily(ctx);
  //   });
  //   // This `ValidationException` was caused by a custom check, so we just get the message from the first
  //   // error (which is a `"REQUEST_BODY"` error) and convert that to a string with `toString()`. This gives
  //   // a `String` that has all the details of the exception, which we can make sure contains information
  //   // that would help a developer sort out validation errors.
  //   String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();

  //   // The message should be the message from our code under test, which should also include the text
  //   // we tried to parse as an email, namely "notanumber".
  //   assertTrue(exceptionMessage.contains("notanumber"));
  // }



  //have not implemented addFamily functions at this time:

  // @Test
  // void addFamilyWithoutName() throws IOException {
  //   String newFamilyJson = """
  //       {
  //         "age": 25,
  //         "company": "testers",
  //         "email": "test@example.com",
  //         "role": "viewer"
  //       }
  //       """;

  //   when(ctx.body()).thenReturn(newFamilyJson);
  //   when(ctx.bodyValidator(Family.class))
  //       .then(value -> new BodyValidator<Family>(newFamilyJson, Family.class,
  //                       () -> javalinJackson.fromJsonString(newFamilyJson, Family.class)));

  //   // This should now throw a `ValidationException` because
  //   // the JSON for our new family has no name.
  //   ValidationException exception = assertThrows(ValidationException.class, () -> {
  //     familyController.addNewFamily(ctx);
  //   });
  //   // This `ValidationException` was caused by a custom check, so we just get the message from the first
  //   // error (which is a `"REQUEST_BODY"` error) and convert that to a string with `toString()`. This gives
  //   // a `String` that has all the details of the exception, which we can make sure contains information
  //   // that would help a developer sort out validation errors.
  //   String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();

  //   // The message should be the message from our code under test, which should also include some text
  //   // indicating that there was a missing family name.
  //   assertTrue(exceptionMessage.contains("non-empty family name"));
  // }

  // @Test
  // void addEmptyNameFamily() throws IOException {
  //   String newFamilyJson = """
  //       {
  //         "name": "",
  //         "age": 25,
  //         "company": "testers",
  //         "email": "test@example.com",
  //         "role": "viewer"
  //       }
  //       """;

  //   when(ctx.body()).thenReturn(newFamilyJson);
  //   when(ctx.bodyValidator(Family.class))
  //       .then(value -> new BodyValidator<Family>(newFamilyJson, Family.class,
  //                       () -> javalinJackson.fromJsonString(newFamilyJson, Family.class)));

  //   // This should now throw a `ValidationException` because
  //   // the JSON for our new family has an invalid email address.
  //   ValidationException exception = assertThrows(ValidationException.class, () -> {
  //     familyController.addNewFamily(ctx);
  //   });
  //   // This `ValidationException` was caused by a custom check, so we just get the message from the first
  //   // error (which is a `"REQUEST_BODY"` error) and convert that to a string with `toString()`. This gives
  //   // a `String` that has all the details of the exception, which we can make sure contains information
  //   // that would help a developer sort out validation errors.
  //   String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();

  //   // The message should be the message from our code under test, which should also include some text
  //   // indicating that there was an empty string for the family name.
  //   assertTrue(exceptionMessage.contains("non-empty family name"));
  // }

  // @Test
  // void addInvalidRoleFamily() throws IOException {
  //   String newFamilyJson = """
  //       {
  //         "name": "Test Family",
  //         "age": 25,
  //         "company": "testers",
  //         "email": "test@example.com",
  //         "role": "invalidrole"
  //       }
  //       """;

  //   when(ctx.body()).thenReturn(newFamilyJson);
  //   when(ctx.bodyValidator(Family.class))
  //       .then(value -> new BodyValidator<Family>(newFamilyJson, Family.class,
  //                       () -> javalinJackson.fromJsonString(newFamilyJson, Family.class)));

  //   // This should now throw a `ValidationException` because
  //   // the JSON for our new family has an invalid family role.
  //   ValidationException exception = assertThrows(ValidationException.class, () -> {
  //     familyController.addNewFamily(ctx);
  //   });
  //   // This `ValidationException` was caused by a custom check, so we just get the message from the first
  //   // error (which is a `"REQUEST_BODY"` error) and convert that to a string with `toString()`. This gives
  //   // a `String` that has all the details of the exception, which we can make sure contains information
  //   // that would help a developer sort out validation errors.
  //   String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();

  //   // The message should be the message from our code under test, which should also include the text
  //   // we tried to use as a role, namely "invalidrole".
  //   assertTrue(exceptionMessage.contains("invalidrole"));
  // }

  // @Test
  // void addFamilyWithoutCompany() throws IOException {
  //   String newFamilyJson = """
  //       {
  //         "name": "Test Family",
  //         "age": 25,
  //         "email": "test@example.com",
  //         "role": "viewer"
  //       }
  //       """;

  //   when(ctx.body()).thenReturn(newFamilyJson);
  //   when(ctx.bodyValidator(Family.class))
  //       .then(value -> new BodyValidator<Family>(newFamilyJson, Family.class,
  //                       () -> javalinJackson.fromJsonString(newFamilyJson, Family.class)));

  //   // This should now throw a `ValidationException` because
  //   // the JSON for our new family has no company.
  //   ValidationException exception = assertThrows(ValidationException.class, () -> {
  //     familyController.addNewFamily(ctx);
  //   });
  //   // This `ValidationException` was caused by a custom check, so we just get the message from the first
  //   // error (which is a `"REQUEST_BODY"` error) and convert that to a string with `toString()`. This gives
  //   // a `String` that has all the details of the exception, which we can make sure contains information
  //   // that would help a developer sort out validation errors.
  //   String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();

  //   // The message should be the message from our code under test, which should also include some text
  //   // indicating that there was a missing company name.
  //   assertTrue(exceptionMessage.contains("non-empty company name"));
  // }

  // @Test
  // void addFamilyWithNeitherCompanyNorName() throws IOException {
  //   String newFamilyJson = """
  //       {
  //         "name": "",
  //         "age": 25,
  //         "company": "",
  //         "email": "test@example.com",
  //         "role": "viewer"
  //       }
  //       """;

  //   when(ctx.body()).thenReturn(newFamilyJson);
  //   when(ctx.bodyValidator(Family.class))
  //       .then(value -> new BodyValidator<Family>(newFamilyJson, Family.class,
  //                       () -> javalinJackson.fromJsonString(newFamilyJson, Family.class)));

  //   // This should now throw a `ValidationException` because
  //   // the JSON for our new family has an invalid email address.
  //   ValidationException exception = assertThrows(ValidationException.class, () -> {
  //     familyController.addNewFamily(ctx);
  //   });
  //   // We should have _two_ errors here both of type `REQUEST_BODY`. The first should be for the
  //   // missing name and the second for the missing company.
  //   List<ValidationError<Object>> errors = exception.getErrors().get("REQUEST_BODY");

  //   // Check the family name error
  //   // It's a little fragile to have the tests assume the family error is first and the
  //   // company error is second.
  //   String nameExceptionMessage = errors.get(0).toString();
  //   assertTrue(nameExceptionMessage.contains("non-empty family name"));

  //   // Check the company name error
  //   String companyExceptionMessage = errors.get(1).toString();
  //   assertTrue(companyExceptionMessage.contains("non-empty company name"));
  // }

  // @Test
  // void deleteFoundFamily() throws IOException {
  //   String testID = samsId.toHexString();
  //   when(ctx.pathParam("id")).thenReturn(testID);

  //   // Family exists before deletion
  //   assertEquals(1, db.getCollection("families").countDocuments(eq("_id", new ObjectId(testID))));

  //   familyController.deleteFamily(ctx);

  //   verify(ctx).status(HttpStatus.OK);

  //   // Family is no longer in the database
  //   assertEquals(0, db.getCollection("families").countDocuments(eq("_id", new ObjectId(testID))));
  // }

  // @Test
  // void tryToDeleteNotFoundFamily() throws IOException {
  //   String testID = samsId.toHexString();
  //   when(ctx.pathParam("id")).thenReturn(testID);

  //   familyController.deleteFamily(ctx);
  //   // Family is no longer in the database
  //   assertEquals(0, db.getCollection("families").countDocuments(eq("_id", new ObjectId(testID))));

  //   assertThrows(NotFoundResponse.class, () -> {
  //     familyController.deleteFamily(ctx);
  //   });

  //   verify(ctx).status(HttpStatus.NOT_FOUND);

  //   // Family is still not in the database
  //   assertEquals(0, db.getCollection("families").countDocuments(eq("_id", new ObjectId(testID))));
  // }


}
