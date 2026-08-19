import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const BASE='http://localhost:5173/Nugget-Nihongo-SSW-Konstruksi/';
const OUT='/home/claude/work/shots4'; mkdirSync(OUT,{recursive:true});
const t=new Date(), ed=new Date(t.getTime()+12*86400000).toISOString().slice(0,10);
const P={_v:6,track:'lifeline',theme:'light',onboarded:true,tutorialFlashcard:true,lastMode:null,dailyGoal:20,examDate:ed,audioEnabled:true,studyAnchor:null,furiganaPolicy:'always',flashcardHintCount:2,notes:{},speakOnFlip:false,quizQuestionCount:10,sprintBests:{},dailyChallengeLog:{}};
const G={_v:6,known:[1,2,3,4,5,6,7,8],unknown:[9,10],starred:[3,5],quizWrong:{},wrongCounts:{},wgWrong:{},vocabWrong:{},jacScores:{},wgScores:{},vocabScores:{},streakData:{days:5,lastDate:t.toISOString().slice(0,10)},dailyCount:{count:12,date:t.toISOString().slice(0,10)},recentCards:[3,2,1],milestoneStreak7:false,milestoneQuiz70:false,sessions:[],dailyMission:null};
const b=await chromium.launch();
for(const [n,w,h,dark] of [['mobile-light',390,844,false],['mobile-dark',390,844,true],['desktop',1440,900,false]]){
  const c=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2});
  const p=await c.newPage();
  await p.goto(BASE,{waitUntil:'networkidle'});
  await p.evaluate(({a,g})=>{localStorage.setItem('ssw-prefs',JSON.stringify(a));localStorage.setItem('ssw-progress',JSON.stringify(g));localStorage.setItem('ssw-srs-data',JSON.stringify({_v:6,cards:{}}));},{a:{...P,theme:dark?'dark':'light'},g:G});
  await p.reload({waitUntil:'networkidle'});
  await p.waitForTimeout(900);
  await p.screenshot({path:`${OUT}/${n}.png`});
  console.log('shot',n);
  await c.close();
}
await b.close();
