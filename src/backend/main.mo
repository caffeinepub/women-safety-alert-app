import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Array "mo:core/Array";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Type definitions
  type EmergencyContact = {
    name : Text;
    phone : Text;
    relationship : Text;
  };

  type AlertLog = {
    timestamp : Time.Time;
    latitude : Float;
    longitude : Float;
  };

  public type UserProfile = { name : Text };

  // State stores
  let userProfiles = Map.empty<Principal, UserProfile>();
  let emergencyContacts = Map.empty<Principal, List.List<EmergencyContact>>();
  let alertLogs = Map.empty<Principal, List.List<AlertLog>>();

  // Authorization setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { ?profile };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?profile) { ?profile };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Emergency Contacts management
  public shared ({ caller }) func addEmergencyContact(contact : EmergencyContact) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add emergency contacts");
    };

    let contacts = switch (emergencyContacts.get(caller)) {
      case (null) { List.empty<EmergencyContact>() };
      case (?existing) { existing };
    };

    if (contacts.size() >= 5) {
      Runtime.trap("Cannot add more than 5 contacts");
    };

    contacts.add(contact);
    emergencyContacts.add(caller, contacts);
  };

  public shared ({ caller }) func updateEmergencyContact(index : Nat, contact : EmergencyContact) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update emergency contacts");
    };

    let contacts = switch (emergencyContacts.get(caller)) {
      case (null) { Runtime.trap("No contacts found") };
      case (?existing) { existing };
    };

    if (index >= contacts.size()) {
      Runtime.trap("Invalid contact index");
    };

    let contactsArray = contacts.toArray();
    let newContactsArray = Array.tabulate(
      contactsArray.size(),
      func(i) {
        if (i == index) { contact } else { contactsArray[i] };
      },
    );

    let newContacts = List.fromArray<EmergencyContact>(newContactsArray);
    emergencyContacts.add(caller, newContacts);
  };

  public shared ({ caller }) func removeEmergencyContact(index : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove emergency contacts");
    };

    let contacts = switch (emergencyContacts.get(caller)) {
      case (null) { Runtime.trap("No contacts found") };
      case (?existing) { existing };
    };

    if (index >= contacts.size()) {
      Runtime.trap("Invalid contact index");
    };

    var i = 0;
    let newContacts = contacts.filter(
      func(_) {
        let keep = i != index;
        i += 1;
        keep;
      }
    );
    emergencyContacts.add(caller, newContacts);
  };

  public query ({ caller }) func getEmergencyContacts() : async [EmergencyContact] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view emergency contacts");
    };

    switch (emergencyContacts.get(caller)) {
      case (null) { [] };
      case (?contacts) { contacts.toArray() };
    };
  };

  // Alert Logging
  public shared ({ caller }) func logAlert(latitude : Float, longitude : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log alerts");
    };

    let alert : AlertLog = {
      timestamp = Time.now();
      latitude;
      longitude;
    };

    let alerts = switch (alertLogs.get(caller)) {
      case (null) { List.empty<AlertLog>() };
      case (?existing) { existing };
    };

    alerts.add(alert);
    alertLogs.add(caller, alerts);
  };

  public query ({ caller }) func getAlertLogs() : async [AlertLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view alert logs");
    };

    switch (alertLogs.get(caller)) {
      case (null) { [] };
      case (?alerts) { alerts.toArray() };
    };
  };
};
