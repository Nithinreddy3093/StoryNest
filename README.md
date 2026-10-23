# 📚 StoryNest — Stories That Stay With You

**A home for stories that touch hearts, inspire minds, and stay with you forever.**

StoryNest is a digital storytelling platform where readers can discover beautiful stories and writers can share their creativity with the world. From romance and emotional drama to short stories and nostalgic village love stories, StoryNest brings meaningful storytelling into one place.

🌐 **Live Demo:** [my-story-nest.vercel.app](https://my-story-nest.vercel.app/)

## ✨ Features

- 📖 **Discover Stories** — Explore stories across different genres and themes.
- ❤️ **Featured Stories** — Discover selected stories directly from the homepage.
- 🔍 **Search Stories** — Find stories and authors easily.
- 🏷️ **Browse by Genre** — Explore romance, drama, emotional stories, tragedy, friendship, and more.
- 📚 **Story Series** — Follow connected stories and episodes in a series.
- 🔥 **Top Reads** — Discover popular stories.
- ✍️ **Publish Stories** — Share your own stories with readers.
- 📄 **PDF Support** — Access stories published in PDF format.
- 👤 **Author Profiles** — Discover stories written by your favorite authors.
- 📱 **Responsive Design** — Enjoy a reading experience across desktop, tablet, and mobile devices.
- 🔐 **Authentication** — Access account-related features through the integrated authentication flow.

## 🖥️ Platform Preview

StoryNest is designed around a simple, welcoming reading experience, with navigation for Home, Stories, Series, Genres, Top Reads, About, and Contact.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe application development |
| Vite | Development server and build tooling |
| Firebase Authentication | User authentication |
| Cloud Firestore | Application data and story management |
| Firebase Security Rules | Access control and data protection |
| Vercel | Application deployment |
| GitHub | Version control and collaboration |

## 📂 Project Structure

```text
StoryNest/
├── public/                 # Public assets
├── scripts/                # Project scripts
├── src/                    # Application source code
├── assets/
│   └── .aistudio/           # AI Studio project assets
├── firebase-blueprint.json  # Firebase project blueprint
├── firebase-applet-config.json
├── firestore.rules          # Firestore security rules
├── index.html               # Application HTML entry
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

*The structure above highlights the main repository files and directories.*

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/)
- npm
- A Firebase project with the required services configured

### 1. Clone the Repository

```bash
git clone https://github.com/Nithinreddy3093/StoryNest.git
cd StoryNest
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Review `.env.example` if available, and configure the environment variables required by your application.

Add the appropriate Firebase configuration and any other required settings. Never commit private credentials, service-account keys, or production secrets to GitHub.

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal to access StoryNest.

### 5. Build for Production

```bash
npm run build
```

Run the production preview if supported by the project's scripts:

```bash
npm run preview
```

## 🌐 Deployment

StoryNest is deployed on Vercel.

To deploy your own instance:

1. Import the GitHub repository into Vercel.
2. Configure the required environment variables.
3. Configure Firebase Authentication and authorized domains.
4. Verify the Firestore database and security rules.
5. Deploy the application.
6. Test story discovery, publishing, authentication, and series navigation.

**Live application:** [https://my-story-nest.vercel.app/](https://my-story-nest.vercel.app/)

## 📚 Explore StoryNest

Some of the stories featured on the platform include:

- **ONE DAY, I'LL TELL YOU** — Emotional drama
- **SURYA & BHUMI** — Emotional drama
- **Surya & Bhumi EP-2** — Story series
- **THE LOVE THAT WAITED** — A 1990s village love story
- **The Curse of Losing Whatever I Have Loved** — Emotional short story

These stories reflect the platform's focus on emotional, memorable, and relatable storytelling.

## 🔒 Security

StoryNest uses Firebase-related configuration and Firestore security rules.

For a secure deployment:

- Keep private credentials out of source control.
- Apply appropriate database read and write permissions.
- Restrict publishing and editing operations to authorized users.
- Validate uploaded files and user input.
- Test authentication and access permissions before production deployment.

## 🔮 Future Enhancements

Potential improvements for StoryNest include:

- Personalized story recommendations
- Bookmarks and reading lists
- Reader comments and reviews
- Likes and author following
- Reading progress tracking
- Advanced search and genre filters
- Notifications for new episodes
- Author analytics and reading statistics
- AI-powered story recommendations and writing assistance

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request describing your improvements.

## 👨‍💻 Author

**Marthala Nithin Reddy**

- GitHub: [@Nithinreddy3093](https://github.com/Nithinreddy3093)
- Live Project: [StoryNest](https://my-story-nest.vercel.app/)

## 📄 License

No license has been specified here. If you intend to make the code available for reuse, add an appropriate `LICENSE` file to the repository.

---

*StoryNest — Read, feel, and publish stories without boundaries.*
