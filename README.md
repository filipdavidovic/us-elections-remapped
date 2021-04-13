# Visual Computing Project - Group 15a
This repository holds the work done by Group 15a (Catalin Bahrin, Theodor Chirvasuta, Filip Davidovic) in the 2021 iteration of the Visual Computing Project (2IMV10) course of TU/e. 

The goal of the project was to represent election-related data in an understandable way. This is achieved by using map representations such as cartograms and colorpleths. The election-related data includes electoral college votes, as well as long- and short-term factors that influence election outcomes. You can read more about it in [the official report](https://mega.nz/file/NMgTzS4D#7zj2CufOSff8ICPNyOw4UMHsyIJyO3vVyZgf-m7E7c8).

Current version of the project is hosted [here](https://visual-computing-project-group15a.netlify.app/).

## Install Instructions
The project is built using "plain" JavaScript as a single page application, and is meant to run in a browser. Therefore, installing the project means cloning this repository and opening `index.html` in your favorite browser (application was implemented to be cross-browser compatible, but was tested on Google Chrome). It is meant to be used with a desktop browser only, so viewing it on a mobile device may have unpredicted behavior.

```bash
git clone git@github.com:filipdavidovic/visual-computing-project.git

cd visual-computing-project

python3 -m http.server 8080

# Open http://localhost:8080/index.html with your favorite browser
```
