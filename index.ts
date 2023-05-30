import cors from 'cors';
import express, {Express, Request, Response} from 'express';
import bodyParser from 'body-parser';
import { reclaimprotocol } from '@reclaimprotocol/reclaim-sdk';
import {v4} from 'uuid';

const app: Express = express();

app.use(cors());
app.use(express.text({ type: "*/*" }));
app.use(bodyParser.json());

app.set('views', './views');
app.set('view engine', 'ejs');

// const callbackUrl = process.env.CALLBACK_URL;
const callbackUrl = "https://recanon.onrender.com/callback/";

const sessionId = v4();
let responseSelections = [ { responseMatch: `.*Rating.*${0}</span>` } ];
const reclaim = new reclaimprotocol.Reclaim()


function buildTemplate(callbackUrl:string, rating:string) {
    responseSelections = [ { responseMatch: `.*Rating.*${rating}</span>` } ];
    const connection = reclaim.connect(
      `My CodeForces Rating ${rating}`,  // a title that will be shown to the user
                                        // Good to mention what proof you're seeking
  
      [                                 // List of proofs you need from the user
        {
          provider: 'http',
          payload: {
                  metadata: {
                    name: "Your codeforces rating", // What data you're extracting from the user's profile
                    logoUrl: "https://codeforces.org/s/0/apple-icon-180x180.png" 
                  },
                  url: 'https://codeforces.com/', //URL which needs to be opened to extract information from 
                  method: 'GET', // HTTP Method (Allowed : GET/POST)
                  login: {
                    url: 'https://codeforces.com/enter/', // Where should the user be redirected if they're not logged in to access the above mentioned URL
                    checkLoginCookies: ['JSESSIONID'], // Cookies that are set when a user is logged in
                  },
                  responseSelections: responseSelections, // defined globally above
                  parameters: { 
                    rating: rating,
                  }
            },
        templateClaimId: v4(), // id for each claim for tracking if relevant proofs have been submitted by the user
        }
      ],
      callbackUrl
    );
  
    const template = connection.generateTemplate(sessionId);
    return template;
  }

app.get("/", (req: Request, res: Response, next) => {
    res.status(200).json({msg: "CF recruiters"});
    return;
});

app.get("/prove-rating/:rating", (req: Request, res: Response, next) => {
    const rating = req.params.rating;
    console.log(rating);

    const template = buildTemplate(callbackUrl, rating);

    res.json({
        template_url: template.url,
    });
});

let lastproof = {};
let parameters: {[key:string]: string} = {}

app.get("/get-proof", (req: Request, res: Response, next) => {
  console.log(lastproof);
  // console.log(parameters);
  const decoded = decodeURIComponent(JSON.stringify(lastproof));
  console.log("Decoded = " + decoded);
  const correctdecoded = decoded.slice(1,-1)
  console.log("Corrected Decoded = " + correctdecoded);

  // res.json(JSON.parse(correctdecoded).proofs[0]);
  res.send(correctdecoded);
});



app.post('/callback/:id', async (req: Request, res: Response) => {

  // console.log(req.body)
  lastproof = req.body;

  const proofs = reclaimprotocol.utils.getProofsFromRequestBody(req.body);
  // proof = proofs[0];
  console.log(proofs[0]);
  console.log("^^^^^^ proofs[0] above ^^^^^^^^")
  // for (const proof of proofs)
  // {
  //   const parametersExtracted = reclaimprotocol.utils.extractParameterValues(responseSelections, proof);
  //   parameters = {...parameters, ...parametersExtracted};
  //   console.log("param extracted:")
  //   console.log(parametersExtracted);
  //   console.log(`The parameters extracted: ${parameters}`)
  //   // console.log(`The json parse value: ${JSON.parse(parameters)}`)
  //   // const jsonstring = JSON.stringify(parameters);
  //   // console.log(jsonstring);
  //   // for (let key in parameters)
  //   // {
  //   //   console.log(key + " = " + parameters.key)
  //   // }
  // }

  // if (await reclaim.verifyCorrectnessOfProofs(proofs))
  // {
  //   console.log("##@@@ Proof Verified @@@##")
  // }
  // const decoded = decodeURIComponent(req.body);
  // console.log(decoded);
  // console.log(JSON.stringify(decoded));

  // const proof = JSON.parse(`${proofs[0]}`);
  // console.log(`The proof is:\n ${proof}`);
  // console.log(JSON.stringify(proof));
  // for (let key in decoded)
  // {
  //   console.log(key + " = " + `${decoded}`)
  // }

  // console.log("Got callback for id: " + req.params.id);
  // if(!req.params.id){
  //   res.send(`400 - Bad Request: callbackId is required`)
  //   return
  // }
  // if(!req.body.claims){
  //   res.send(`400 - Bad Request: claims are required`)
  //   return
  // }
  // const callbackId = req.params.id;
  // const claims = { claims: req.body.claims };
  // proof = claims;
  // console.log(claims);

  // res.json({
  //   // proof: claims,
  //   listOfProof: proof,

  // });

  res.send("200 - OK")

});

// app.get("/callback/:id", (req:Request, res: Response, next) => {
//   console.log("Get request to /callback/:id");
//   // const proofs = reclaimprotocol.utils.getProofsFromRequestBody(req.body);
//   // console.log(proofs)
//   // console.log(req)
//   console.log(req.params.claim);
//   console.log(req.params);
//   console.log(req.body);
//   // res.json(proofs);
//   res.send(req.body)
// });


app.listen(3000);