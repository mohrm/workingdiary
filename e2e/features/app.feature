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
  Scenario: The colon is evenly spaced between the hour and minute of a time
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And I log out
    Then the colon between hour and minute is evenly spaced for section "0"'s start and end time

  @stable-layout
  Scenario: The gap around the time range separator is clearly wider than around the colon
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And I log out
    Then the gap around the range separator is clearly wider than the colon gap for section "0"'s start and end time

  @stable-layout
  Scenario: The section rows do not overflow the section list horizontally
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "09:00:00"
    And I log out
    Then the section rows do not overflow the section list horizontally

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


  Scenario: Deleting a section can be undone
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "09:00:00"
    And I log out
    And I delete section "0"
    Then I see the undo hint
    And no sections are left
    When I click the undo button
    Then I see that section "0" has start time "08:00" and end time "09:00"
    And the undo hint is gone

  Scenario: The undo hint can be dismissed without restoring the section
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "09:00:00"
    And I log out
    And I delete section "0"
    Then I see the undo hint
    And no sections are left
    When I dismiss the undo hint
    Then the undo hint is gone
    And no sections are left

  Scenario: The undo affordance only restores the most recently deleted section
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "09:00:00"
    And I log out
    And time moves forward to "2025-02-17" at "09:30:00"
    And I log in
    And time moves forward to "2025-02-17" at "10:00:00"
    And I log out
    And I delete section "0"
    And I delete section "0"
    When I click the undo button
    Then I see that section "0" has start time "09:30" and end time "10:00"
    And the undo hint is gone

  @stable-layout
  Scenario: The undo toast does not move the stempeluhr or the section list
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "09:00:00"
    And I log out
    And I remember the position of the stempeluhr and the section list
    And I delete section "0"
    Then I see the undo hint
    And the stempeluhr and the section list have not moved
    When I click the undo button
    Then the stempeluhr and the section list have not moved

  @stable-layout
  Scenario: The app page itself never scrolls
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in and out 3 times starting at "08:00:00" for 30 minutes each
    Then the page itself does not scroll
    When I delete section "0"
    Then I see the undo hint
    And the page itself does not scroll
    When I click the undo button
    Then the page itself does not scroll

  @stable-layout
  Scenario: The navigation row stays visible after a reload with a shrunk viewport
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in and out 3 times starting at "08:00:00" for 30 minutes each
    And I reload the page
    And the viewport shrinks like the browser toolbar reappearing
    Then the page itself does not scroll
    And the navigation row is fully visible

@stable-layout
Scenario: The version information opens in a centered dialog
  Given today's date is "2025-02-17" and the current time is "08:00:00"
  When I open the day plan for today
  Then the version information dialog is gone
  When I click the version info icon
  Then I see the version information dialog
  And the version information dialog is centered on the page
  And I can export my data from the version information dialog
  And the version information dialog links to the viewport checker
  And the page itself does not scroll

@stable-layout
Scenario: The version information dialog closes again
  Given today's date is "2025-02-17" and the current time is "08:00:00"
  When I open the day plan for today
  And I click the version info icon
  Then I see the version information dialog
  And I press Escape
  Then the version information dialog is gone
  When I click the version info icon
  And I see the version information dialog
  And I close the version information dialog
  Then the version information dialog is gone

  Scenario: Opening the time distribution screen from the day plan
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "16:00:00"
    And I log out
    And I open the time distribution
    Then I see "Zeitverteilung für den 17.02.2025" on the heading
    And I see the total duration of "8,00" industrial time
    And I see an entry for unassigned time

  Scenario: Distributing the day's total duration across activities
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "16:00:00"
    And I log out
    And I open the time distribution
    And I add the free text activity "Review" with "2,5" industrial time
    And I choose the predefined activity "Programmierung"
    And I set the duration of activity "1" to "1,25" industrial time
    Then activity "0" is "Review" with "2,50" industrial time
    And activity "1" is "Programmierung" with "1,25" industrial time
    And the unassigned time shows "4,25" industrial time

  Scenario: An activity duration can also be entered as a percentage
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "16:00:00"
    And I log out
    And I open the time distribution
    And I add the free text activity "Review" with "25" percent of the day
    Then activity "0" is "Review" with "2,00" industrial time

  Scenario: Changing an activity duration via the percentage input
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "16:00:00"
    And I log out
    And I open the time distribution
    And I add the free text activity "Review" with "1" industrial time
    And I set the percentage of activity "0" to "50"
    Then activity "0" is "Review" with "4,00" industrial time

  Scenario: Activity durations stay visible after being confirmed
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "16:00:00"
    And I log out
    And I open the time distribution
    And I add the free text activity "Review" with "2,5" industrial time
    Then the duration input of activity "0" shows "2,50"

  Scenario: Activity rows show exact and quarter-hour-rounded industrial time
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "16:00:00"
    And I log out
    And I open the time distribution
    And I add the free text activity "Review" with "2,38" industrial time
    Then activity "0" shows "2,38 / 2,50" exact and rounded industrial time

  Scenario: An activity cannot take more time than is left
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "09:00:00"
    And I log out
    And I open the time distribution
    And I add the free text activity "Alles" with "9" industrial time
    Then I see the time distribution error message

  Scenario: Returning from the time distribution to the day plan
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I open the time distribution
    And I go back to the day plan
    Then I see "Tagesplan für den 17.02.2025" on the heading

  Scenario: The time distribution survives a reload
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "16:00:00"
    And I log out
    And I open the time distribution
    And I add the free text activity "Review" with "2,5" industrial time
    And I reload the page
    Then I see "Zeitverteilung für den 17.02.2025" on the heading
    And activity "0" is "Review" with "2,50" industrial time

  Scenario: Days without a time distribution keep working
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "16:00:00"
    And I log out
    And I open the time distribution
    And I add the free text activity "Review" with "2,5" industrial time
    When I go back to the day plan
    And I go to the previous day
    Then I see "Tagesplan für den 17.02.2025" on the heading
    And the day still shows the log button

  @stable-layout
  Scenario: The time distribution title is fully visible on a narrow viewport
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "16:00:00"
    And I log out
    And I open the time distribution
    Then the time distribution title is fully visible

  @stable-layout
  Scenario: Opening the time distribution does not move the summary and navigation
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "16:00:00"
    And I log out
    And I remember the position of the summary and the navigation row
    And I open the time distribution
    Then the summary and the navigation row have not moved

  @stable-layout
  Scenario: The time distribution page itself never scrolls
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "16:00:00"
    And I log out
    And I open the time distribution
    Then the page itself does not scroll

  @stable-layout
  Scenario: Adding an activity does not move the back button
    Given today's date is "2025-02-17" and the current time is "08:00:00"
    When I open the day plan for today
    And I log in
    And time moves forward to "2025-02-17" at "16:00:00"
    And I log out
    And I open the time distribution
    And I remember the position of the back button
    And I add the free text activity "Review" with "2,5" industrial time
    Then the back button has not moved
