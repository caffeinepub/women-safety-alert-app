import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  // Old types (inline - from previous deployment)
  type UserRole = {#admin; #guest; #user};
  type OldAccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  type EmergencyContact = {
    name : Text;
    phone : Text;
    relationship : Text;
  };

  type AlertLog = {
    timestamp : Int;
    latitude : Float;
    longitude : Float;
  };

  type UserProfile = { name : Text };

  type OldActor = {
    accessControlState : OldAccessControlState;
    alertLogs : Map.Map<Principal, List.List<AlertLog>>;
    emergencyContacts : Map.Map<Principal, List.List<EmergencyContact>>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type NewActor = {
    alertLogs : Map.Map<Principal, List.List<AlertLog>>;
    emergencyContacts : Map.Map<Principal, List.List<EmergencyContact>>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    {
      alertLogs = old.alertLogs;
      emergencyContacts = old.emergencyContacts;
      userProfiles = old.userProfiles;
    }
  };
};
