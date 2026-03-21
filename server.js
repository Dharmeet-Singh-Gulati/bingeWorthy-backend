import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";
import {
  API_MOVIES_NOW_PLAYING,
  API_POPPULAR_MOVIES,
  API_TOP_RATED,
  MOVIE_DETAILS_API,
  NUMBER_MOVIES,
} from "./constants.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

const PORT = process.env.PORT || 5000;

const openai = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HUGGING_FACE_KEY,
});

app.post("/api/gpt-search", async (req, res) => {
  try {
    console.log("GPT search hit backend");
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai",
      messages: [
        {
          role: "system",
          content:
            "You are a movie recommendation system. Give exactly " +
            NUMBER_MOVIES +
            " movie names. No explanation. Do not give numbering. Do not give the release Year or Date. Make them comma separated",
        },
        {
          role: "user",
          content: `Genre: ${query}`,
        },
      ],
    });

    res.json(completion);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "GPT request failed" });
  }
});

// 🔐 Axios config
const axiosConfig = {
  headers: {
    Authorization: `Bearer ${process.env.TMDB_KEY}`,
  },
};

// 🔁 Reusable fetch function
const fetchFromTmdb = async (url, params = {}) => {
  try {
    const response = await axios.get(url, {
      ...axiosConfig,
      params,
    });
    return response.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
};

// 🎬 Now Playing
app.get("/api/now-playing", async (req, res) => {
  try {
    const { page = 1 } = req.query; // 👈 IMPORTANT
    console.log("Now playing, page:", page);

    const data = await fetchFromTmdb(
      "https://api.themoviedb.org/3/discover/movie",
      {
        include_adult: false,
        include_video: false,
        language: "en-US",
        sort_by: "popularity.desc",
        page, // 👈 passes to TMDB
      },
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

// 🔥 Popular
app.get("/api/popular", async (req, res) => {
  const page = req.query.page || 1;

  try {
    console.log("Now popular");
    const data = await fetchFromTmdb(API_POPPULAR_MOVIES, { page });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch popular movies" });
  }
});

// ⭐ Top Rated
app.get("/api/top-rated", async (req, res) => {
  const page = req.query.page || 1;

  try {
    console.log("Now toprated");
    const data = await fetchFromTmdb(API_TOP_RATED, { page });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch top rated movies" });
  }
});

// 🔍 Search (clean version, no URL mutation)
app.get("/api/search", async (req, res) => {
  const { q, page = 1 } = req.query;

  if (!q) {
    console.log("Search hits backend but no response");
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  try {
    console.log("🔍 Search:", q);
    const data = await fetchFromTmdb(
      "https://api.themoviedb.org/3/search/movie",
      {
        query: q,
        page,
      },
    );
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to search movies" });
  }
});

// 🎥 Movie Details
app.get("/api/movie/:id", async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid movie ID" });
  }

  try {
    const data = await fetchFromTmdb(`${MOVIE_DETAILS_API}${id}`);
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch movie details" });
  }
});

// Cast Details 🤵
app.get("/api/movie/:id/cast", async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid movie ID" });
  }

  try {
    console.log("🎭 Cast request for:", id);

    const data = await fetchFromTmdb(`${MOVIE_DETAILS_API}${id}/credits`);

    res.json(data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch movie cast" });
  }
});

//Recommendations 🎬
app.get("/api/movie/:id/recommendations", async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid movie ID" });
  }

  try {
    console.log("🎬 Recommendations for:", id);

    const data = await fetchFromTmdb(
      `${MOVIE_DETAILS_API}${id}/recommendations`,
    );

    res.json(data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

// Videos 🎥
app.get("/api/movie/:id/videos", async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid movie ID" });
  }

  try {
    console.log("🎥 Fetching videos for:", id);

    const data = await fetchFromTmdb(`${MOVIE_DETAILS_API}${id}/videos`);

    res.json(data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
