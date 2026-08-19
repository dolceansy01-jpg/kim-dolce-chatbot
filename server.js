import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/* =========================
   MIDDLEWARE
========================= */

app.use(
  express.json({
    limit: "10mb"
  })
);

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);


/* =========================
   OPENROUTER
========================= */

const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY;


/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {

  res.json({
    status: "online",
    service: "KIM DOLCE AI"
  });

});


/* =========================
   CHAT AI
========================= */

app.post("/api/chat", async (req, res) => {

  try {

    const {
      message,
      image
    } = req.body;


    /* CHECK API KEY */

    if (!OPENROUTER_API_KEY) {

      return res.status(500).json({
        error:
          "OPENROUTER_API_KEY manke nan Render Environment."
      });

    }


    /* CHECK MESSAGE */

    if (
      (!message ||
        !message.trim()) &&
      !image
    ) {

      return res.status(400).json({
        error:
          "Mesaj oswa foto obligatwa."
      });

    }


    /* =========================
       CONTENT
    ========================= */

    const content = [];


    /* TEXT */

    if (
      message &&
      message.trim()
    ) {

      content.push({
        type: "text",
        text: message.trim()
      });

    }


    /* IMAGE */

    if (image) {

      content.push({
        type: "image_url",

        image_url: {
          url: image
        }

      });

    }


    /* =========================
       OPENROUTER REQUEST
    ========================= */

    const response =
      await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {

          method: "POST",

          headers: {

            "Authorization":
              `Bearer ${OPENROUTER_API_KEY}`,

            "Content-Type":
              "application/json",

            "HTTP-Referer":
              "https://kim-dolce-chatbot.onrender.com",

            "X-Title":
              "KIM DOLCE AI"

          },


          body: JSON.stringify({

            model:
              "openrouter/free",


            messages: [

              {
                role: "system",

                content: `
Ou se KIM DOLCE AI,
yon assistant intelligent,
respekte epi itil.

Lang ou sipòte:
- Kreyòl Ayisyen
- Français
- English

Si itilizatè a ekri Kreyòl,
reponn an Kreyòl.

Si itilizatè a ekri Français,
reponn an Français.

Si itilizatè a ekri English,
reponn an English.

Si itilizatè a voye yon foto,
analize foto a epi reponn kesyon
li poze sou foto a.

Pa envante enfòmasyon.
Si ou pa sèten, di itilizatè a sa.
                `
              },


              {
                role: "user",

                content: content

              }

            ]

          })

        );


    /* =========================
       OPENROUTER RESPONSE
    ========================= */

    const data =
      await response.json();


    if (!response.ok) {

      console.error(
        "OPENROUTER ERROR:",
        data
      );


      return res
        .status(response.status)
        .json({

          error:
            data?.error?.message ||
            "OpenRouter pa kapab trete demann lan."

        });

    }


    /* =========================
       GET AI RESPONSE
    ========================= */

    const reply =
      data?.choices?.[0]?.message?.content;


    if (!reply) {

      return res.status(500).json({

        error:
          "OpenRouter pa retounen okenn repons."

      });

    }


    /* =========================
       SEND RESPONSE
    ========================= */

    res.json({

      reply

    });


  } catch (error) {

    console.error(
      "SERVER ERROR:",
      error
    );


    res.status(500).json({

      error:
        "Erreur serveur KIM DOLCE AI."

    });

  }

});


/* =========================
   FRONTEND
========================= */

app.get(
  "/{*splat}",
  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        "public",
        "index.html"
      )
    );

  }
);


/* =========================
   START SERVER
========================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `KIM DOLCE AI running on port ${PORT}`
    );

  }
);
