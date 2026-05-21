export async function handler(event){

  try{

    const body =
    JSON.parse(event.body);

    const text =
    body.text;

    const instruction =
    body.instruction;

    const response =
    await fetch(

      "https://api.openai.com/v1/chat/completions",

      {

        method:"POST",

        headers:{

          "Content-Type":"application/json",

          Authorization:
          `Bearer ${process.env.OPENAI_API_KEY}`

        },

        body:JSON.stringify({

          model:"gpt-4o-mini",

          response_format:{
            type:"json_object"
          },

          messages:[

            {
              role:"system",
              content:`

${instruction}

Return STRICT JSON:

{
  "intent":"",
  "rewrite":"",
  "replies":[
    "",
    "",
    "",
    ""
  ]
}

`
            },

            {
              role:"user",
              content:text
            }

          ]

        })

      }

    );

    const data =
    await response.json();

    const raw =
    data.choices?.[0]?.message?.content;

    const parsed =
    JSON.parse(raw);

    return{

      statusCode:200,

      body:JSON.stringify({

        result:
        parsed.rewrite,

        intent:
        parsed.intent,

        replies:
        parsed.replies

      })

    };

  }catch(error){

    return{

      statusCode:500,

      body:JSON.stringify({

        error:error.message

      })

    };

  }

}