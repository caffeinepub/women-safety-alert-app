import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Array "mo:core/Array";



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

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { ?profile };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // Emergency Contacts management
  public shared ({ caller }) func addEmergencyContact(contact : EmergencyContact) : async () {
    let contacts = switch (emergencyContacts.get(caller)) {
      case (null) { List.empty<EmergencyContact>() };
      case (?existing) { existing };
    };

    contacts.add(contact);
    emergencyContacts.add(caller, contacts);
  };

  public shared ({ caller }) func updateEmergencyContact(index : Nat, contact : EmergencyContact) : async () {
    let contacts = switch (emergencyContacts.get(caller)) {
      case (null) { return };
      case (?existing) { existing };
    };

    if (index >= contacts.size()) { return };

    let contactsArray = contacts.toArray();
    let newContactsArray = Array.tabulate(
      contactsArray.size(),
      func(i : Nat) : EmergencyContact {
        if (i == index) { contact } else { contactsArray[i] };
      },
    );

    let newContacts = List.fromArray<EmergencyContact>(newContactsArray);
    emergencyContacts.add(caller, newContacts);
  };

  public shared ({ caller }) func removeEmergencyContact(index : Nat) : async () {
    let contacts = switch (emergencyContacts.get(caller)) {
      case (null) { return };
      case (?existing) { existing };
    };

    if (index >= contacts.size()) { return };

    var i = 0;
    let newContacts = contacts.filter(
      func(_ : EmergencyContact) : Bool {
        let keep = i != index;
        i += 1;
        keep;
      }
    );
    emergencyContacts.add(caller, newContacts);
  };

  public query ({ caller }) func getEmergencyContacts() : async [EmergencyContact] {
    switch (emergencyContacts.get(caller)) {
      case (null) { [] };
      case (?contacts) { contacts.toArray() };
    };
  };

  // Alert Logging
  public shared ({ caller }) func logAlert(latitude : Float, longitude : Float) : async () {
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
    switch (alertLogs.get(caller)) {
      case (null) { [] };
      case (?alerts) { alerts.toArray() };
    };
  };
};
