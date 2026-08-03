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

  Scenario: Section editor inputs are fully visible on mobile
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    And the viewport is mobile
    When I open the day plan for today
    And I log in
    And I log out
    And I open the editor for section "0"
    Then the section editor inputs are fully visible

  Scenario: Deleting an edited section does not leave the next new section in edit mode
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And I log out
    And I open the editor for section "0"
    And I delete section "0"
    And I log in
    And I log out
    Then section "0" is not being edited

  @stable-layout
  Scenario: Opening the section editor does not move the time, location or delete controls
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And I log out
    And I remember the position of section "0"'s time, location and delete controls
    And I open the editor for section "0"
    Then section "0"'s time, location and delete controls have not moved

  @stable-layout
  Scenario: Section editor action icons are the same size as everywhere else in the app
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And I log out
    And I open the editor for section "0"
    Then the section editor's action icons are 24 by 24 pixels

  @stable-layout
  Scenario: The location select shows its full label without truncation
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And I log out
    And I open the editor for section "0"
    Then the location select shows its full label without truncation

  @stable-layout
  Scenario: The section editor stays on a single line
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And I log out
    And I open the editor for section "0"
    Then the section editor does not overflow the viewport horizontally

  Scenario: The section list shows Start, Ende and Arbeitsort column headers
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    Then I see the column headers "Start", "Ende" and "Arbeitsort" above the section list

  @stable-layout
  Scenario: The section list column headers are left-aligned with the section values
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And I log out
    Then the column headers are left-aligned with section "0"'s values

  @stable-layout
  Scenario: Clocking in does not move the log button
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I remember the position of the log button
    And I log in
    Then the log button has not moved

  @stable-layout
  Scenario: Clocking out does not move the log button
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And I remember the position of the log button
    And I log out
    Then the log button has not moved

  @stable-layout
  Scenario: The stempeluhr fits on a single line
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    Then the stempeluhr value and log button share a single line

  @stable-layout
  Scenario: Editing the login time keeps the stempeluhr on a single line
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And I open the login time editor
    Then the stempeluhr value and log button share a single line

  @stable-layout
  Scenario: Opening and closing the login time editor does not move the log button
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And I remember the position of the log button
    And I open the login time editor
    Then the log button has not moved
    When I abort the login time edit
    Then the log button has not moved

  @stable-layout
  Scenario: Switching to a different day does not move the stempeluhr or section list
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And I log out
    And time moves forward to "2025-02-18" at "08:00:00"
    And I open the day plan for today
    And I log in
    And I log out
    And I remember the position of the stempeluhr and the section list
    And I go to the previous day
    Then the stempeluhr and the section list have not moved

  @stable-layout
  Scenario: At least four logged sections remain visible without scrolling
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in and out 4 times starting at "08:00:00" for 30 minutes each
    Then at least 4 sections are fully visible without scrolling the section list
