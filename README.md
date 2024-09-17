# Snippets

In our rapidly changing digital age, the way we absorb information is shifting dramatically. Traditional learning methods often can't keep pace with the needs of today's learners, who crave quick, digestible content.Many young people find themselves spending hours on social media, often interacting with content that offers little to no educational value.

I personally wanted to address this challenge, and so I created Snippets — an innovative ed-tech social media platform. Snippets harnesses the power of artificial intelligence to offer engaging, bite-sized learning experiences that are as enjoyable as they are educational. With its AI-generated snippets structured in the 5W1H framework, Snippets makes learning not just accessible, but a delightful journey of discovery.

## Inspiration
The inspiration for [Snippets](https://exploresnippets.today) stemmed from observing the **significant time young people spend on social media, often engaging with content lacking educational value.** Recognizing the potential to transform this screen time into meaningful learning experiences, I was motivated to develop an innovative ed-tech social media platform. The goal was to **address the growing knowledge gap and declining critical thinking skills by offering engaging, bite-sized educational content** that could compete with the addictive nature of traditional social media.

## What it does
[Snippets](https://exploresnippets.today) is an AI-powered educational social media platform that offers:
- Engaging, bite-sized learning experiences in a social media like interface.
- AI-generated educational snippets that are both enjoyable and informative.
- Content structured in the 5W1H framework (Who, What, When, Where, Why, How).
- A space where users can gain valuable knowledge while scrolling, similar to traditional social media.

Current features include:
- **AI-Generated Content:** Instantly create engaging educational snippets on any topic.
- **5W1H Framework:** Information structured for easy understanding.
- **References:** Transparency with all sources listed for each snippet.
- **Similar snippets:** Find similar snippets for a given snippet using vector search.
- **Infinite Scroll Interface:** Seamless browsing through a vast range of topics.
- **Social Features:** Like, save, and share favourite content. Link previews are also supported for sharable snippet links.
- **Notes And Notes Search Features:** Easily jot down notes for any intriguing snippet and search through your notes anytime.

## How I built it
Snippets was built using a combination of modern web technologies:
1. **NextJS** was used as the main frontend framework along with TypeScript.
2. **Convex DB** was chosen as the primary database, offering real-time updates with transactional integrity.
3. User authentication was implemented using **Clerk**.
4. The platform's UI was crafted using a combination of **ShadCN components and Tailwind** to make the platform look awesome!
5. AI Integration: Open source LLMs like **Llama3** were used with **Groq** to generate content.
6. Deployment: The application is deployed on **Vercel**.

Also many of the platform's key and advanced features were developed using Convex's capabilities:
- _Similar snippets suggestions_ use **Convex vector search**.
- _Notes search functionality_ employs **Convex full-text search**.
- _Snippet generation_ is handled through **Convex actions**.
- _Welcome emails_ are sent using **Convex scheduling functions**.
- _Likes and saves_ are optimistically updated in real-time using **Convex's optimistic updates**.

## Challenges I ran into
- Developing AI algorithms that are capable of generating accurate, engaging educational content and ensuring the AI-generated content is valuable, factual, and promotes critical thinking. (Prompt engineering)
- Making sure the snippet generation was fast and at the same time produced the desired output. This was even harder with only using free open-source models rather than proprietary models like Claude.
- Creating a fast and snappy platform that is on par with established social media giants.
- Implementing mid-complex features like notifications, notes, graceful error handling etc.
- Implementing RAG (Retrieval Augmented Generation) which included fetching search results for the requested topic, scraping through the result links, creating chunks of data, finding the most similar chunks and then using it as context for the LLM.

## Accomplishments that I am proud of
- Successfully creating an educational alternative to traditional social media.
- Developing AI capable of generating structured, informative content with open source LLMs and RAG (Retrieval Augmented Generation).
- Addressing the issue of social media addiction by providing a meaningful alternative and potentially improving critical thinking skills and knowledge acquisition among users.

## What I learned
The development of Snippets likely provided insights into:
- The importance of structured, bite-sized content in modern learning and the potential of AI in education and content creation.
- Leveraging Convex DB's advanced features like vector search, full-text search, and scheduled functions for real-time updates and content recommendations.
- Integrating and fine-tuning AI models for consistent, high-quality educational content generation in the 5W1H format.
- Implementing a responsive and performant UI.

## What's next for Snippets
Upcoming features include:
- **Search Functionality:** Quickly find specific snippets with a combination of similarity and full-text search.
- **Daily Rewards & More:** Earn daily XP, receive rewards for generating snippets, and unlock other exciting incentives.
- **Diverse Content Showcase Types:** Explore content formats like ELI5 (Explain Like I'm 5), SWOT analysis, and timelines.
- **Follow Users:** Stay updated with content from favourite contributors.
- **Advanced Generation:** Access content generated by different LLMs and compare results for the best content.

Future development could also focus on:
- Expanding the range of topics covered by the AI-generated snippets.
- Enhancing the platform's capabilities to provide even more engaging and personalized content.
- Growing the user base and potentially partnering with educational institutions for content generation with private data.
- Developing metrics to measure the platform's impact on users' knowledge and skills.

## Conclusion
Thank you, Convex, for hosting the Zero to One hackathon! This event provided an invaluable opportunity to bring Snippets to life. Your platform's powerful features, including scheduled functions, vector search, and full-text search capabilities, were instrumental in creating a robust and responsive educational social media experience. The hackathon not only challenged me to innovate but also showcased the potential of Convex in building modern, scalable applications. 

As a token of gratitude, here is a special snippet for you 😄 - https://exploresnippets.today/snippet/k17c0ajj7ggn1n2zm1mycas4bn70zyq3

### Other References
- [Font - Satoshi](https://www.fontshare.com/fonts/cabinet-grotesk)
- [Storing users in Convex from Clerk via webhooks](https://docs.convex.dev/auth/database-auth)

Snippets was developed for the [Convex zero to one](https://convexhackathon2.devpost.com/) hackathon.