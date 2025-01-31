# Vanilla Flashcard App Template

This is a template of a simple flashcard web application written in HTML, CSS and JavaScript without requiring external libraries or a build process (“vanilla”). It displays a series of flippable cards with customisable content and styles without the need for advanced programming. You are expected to modify and expand upon this template to suit the needs of your project.

Although this template is designed for undergraduate students of a capstone project course in the Education University of Hong Kong, it can also be used by anyone for other projects.

## Getting Started

> [!NOTE]
> This section is intended for our undergraduate students.
> 
> If you are not new to programming, feel free to use your favourite code editor, the `serve` command, or whatever tools you feel comfortable with.

1. Make sure you are logged in to GitHub. Click the “Fork” button at the top right of this page.
2. Click “Create fork”.
3. Open [Visual Studio Code](https://code.visualstudio.com).
4. Click “Clone Git repository” on the Welcome page.
5. Type in your GitHub username, followed by `/vanilla-flashcard-app-template`, and press <kbd>Enter</kbd>.
6. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.
7. Click the “Go Live” button from the status bar at the bottom to view the app.

## How It Works

- The app loads flashcard data from a JSON file, dynamically rendering cards with content on both sides.
- Users can flip the flashcards by clicking on them and navigate using “Back” and “Skip” buttons, displaying one card at a time.
- Learning progress is tracked with “Again”, “Good” and “Easy” buttons, which determine the scheduling of flashcards, similar to Anki, and store this data locally.
- A toggle button in the upper-left corner allows users to view a table of all flashcards, providing an overview of the entire dataset.

## Customising the Dataset

Flashcard data is provided in the [`data/example.json`](/data/example.json) file. This file contains an array of flashcard objects. The fields within are intended as examples, and students should modify or expand these fields to suit their specific project needs. 

Experiment with adding or removing cards and fields, and then refresh your browser to see the changes implemented.

## Designing the Card

To alter the appearance of the flashcards, adjust the CSS stylesheet. Focus on the relevant sections to customise colours, fonts, layouts, etc. For instance, to modify the design of the front side of the card, search for `.card-front` in the CSS stylesheet.

## Modifying the Code

The main functionality is driven by [index.js](/index.js), which handles reading from `example.json` and setting up flashcard interactions. Make adjustments to how cards are displayed by altering JavaScript functions such as `renderCard`.

## Recommended Actions

1. Change the dataset by adding new JSON files within the `data` folder and remove `data/example.json`.
2. Update the `import` statement at the top of `index.js`.
3. Alter HTML elements in the `flashcard` section in `index.html`. Each field in the dataset should correspond to an element with an ID.
4. Modify the `renderCard` function in `index.js` accordingly to make sure all fields are populated properly.
5. Adjust the appearance of the flashcards in `index.css` by adding styling rules for each element.

> [!TIP]
> Search for “STUDENTS” in the files to quickly locate sections where modifications are recommended.

If you encounter any technical problems or have questions, don’t hesitate to reach out for help! We’re always here for advice and support. <sub>[Only applicable for students at EdUHK.]</sub>
