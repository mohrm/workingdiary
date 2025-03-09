Feature: Day plan page

  Scenario: Opening the day plan on a given day
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    Then I see "Tagesplan für den 17.02.2025" on the heading
    And the caption of the log button is "Einstempeln"
 
  Scenario: Logging in
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    Then I see that the login time is "08:00"
    And the caption of the log button is "Ausstempeln"


  Scenario: Logging out
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    And I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "09:00:00"
    And I log out
    And time moves forward to "2025-02-17" at "09:30:00"
    And I log in
    And time moves forward to "2025-02-17" at "12:00:00"
    When I log out
    Then I see that section "0" has start time "08:00" and end time "09:00"
    Then I see that section "1" has start time "09:30" and end time "12:00"