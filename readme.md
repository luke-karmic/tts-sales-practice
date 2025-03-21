<div align="center">

  [![Unlicense License][license-shield]][license-url]
  [![LinkedIn][linkedin-shield]][linkedin-url]

</div>


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">TTS Interview Practice</h3>

  <p align="center">
    Simple TTS Sales call practice project
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

* It is to quiz you on sales call objections, or recording your responses to a sales call structure.
* The idea is you can test for each type of prospect i.e. Analytical, Skeptical and test your recorded responses for a make believe script
* If you find it useful, please show a little love! Cheers
* Uses Google TTS to asks questions, records the output and continues the flow until reaching the end.
* This is built as a quick sales call practice tool
* You can hardcode the questions for now and it will just iterate through them, either randomly or in order
* Super simple, built in a couple hours for a quick use case in mind but thought I'd leave it open incase some one finds it helpful, don't expect fancy code
* All recordings are stored in out/ by default


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

### Installation

_Below is an example of how you can instruct your audience on installing and setting up your app. This template doesn't rely on any external dependencies or services._

1. Clone the repo
   ```sh
   https://github.com/luke-karmic/tts-sales-practice
   ```
2. Clone the repo
   ```npm install
   ```
3. Create a `.env` file, use the example
3. Creat an out directory matching `.env` file i.e. `./out/questions` & `./out/objections`

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

1. Add the corresponding q/a files ./random_objections or ./random_objections
   ```sh
   module.exports.skepticalAnswers = {}
   module.exports.busyAnswers = {}
   module.exports.analyticalAnswers = {}
   ```
2. Add or modify the prospect type array
   ```sh
      const prospects = ["skeptical", "busy", "analytical"];
   ```
3. Run the script
   ```sh
   node full_interview_process.js
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [x] Create basic ordered question answer flow
- [x] Add TTS for audible question asking
- [x] Create randomised flow
- [x] Save the audio files in each run
- [ ] Multiple random voices
- [ ] Refactor to be more re-usable

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTACT -->
## Contact

Luke Taaffe

Project Link: [https://github.com/luke-karmic/tts-sales-practice](https://github.com/luke-karmic/tts-sales-practice)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=for-the-badge
[contributors-url]: https://github.com/othneildrew/Best-README-Template/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=for-the-badge
[forks-url]: https://github.com/othneildrew/Best-README-Template/network/members
[stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=for-the-badge
[stars-url]: https://github.com/othneildrew/Best-README-Template/stargazers
[issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=for-the-badge
[issues-url]: https://github.com/othneildrew/Best-README-Template/issues
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/luketaaffe/
[go-shield]: https://img.shields.io/badge/Go-00ADD8?logo=Go&logoColor=white&style=for-the-badge