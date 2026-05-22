export default async function handler(
  req,
  res
){

  /* ====================================
     METHOD CHECK
  ==================================== */

  if(req.method !== "POST"){

    return res.status(405).json({

      error:
        "Method not allowed"

    });

  }

  try{

    /* ====================================
       BODY
    ==================================== */

    const {

      prompt,

      premium

    } = req.body;

    if(!prompt){

      return res.status(400).json({

        error:
          "Prompt is required"

      });

    }

    /* ====================================
       MODEL
    ==================================== */

    const model = premium

      ? "gpt-4o-mini"

      : "gpt-4o-mini";

    /* ====================================
       OPENAI REQUEST
    ==================================== */

    const response =
      await fetch(

        "https://api.openai.com/v1/chat/completions",

        {

          method:"POST",

          headers:{

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${process.env.OPENAI_API_KEY}`

          },

          body:JSON.stringify({

            model,

            messages:[

              {
                role:"system",

                content:
`You are VoxFix AI.

You rewrite messages professionally,
intelligently,
persuasively
and naturally.

Keep responses polished,
human,
premium
and emotionally intelligent.`

              },

              {
                role:"user",

                content:prompt

              }

            ],

            temperature:
              premium ? 0.9 : 0.7,

            max_tokens:
              premium ? 1200 : 500

          })

        }

      );

    /* ====================================
       RESPONSE
    ==================================== */

    const data =
      await response.json();

    console.log(data);

    /* ====================================
       ERROR HANDLING
    ==================================== */

    if(data.error){

      return res.status(500).json({

        error:
          data.error.message

      });

    }

    const result =

      data.choices?.[0]
      ?.message?.content ||

      "No AI response generated.";

    /* ====================================
       SUCCESS
    ==================================== */

    return res.status(200).json({

      result

    });

  }catch(error){

    console.error(error);

    return res.status(500).json({

      error:
        "AI server failed."

    });

  }

}