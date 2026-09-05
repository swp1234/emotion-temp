const QUESTIONS = [
  {textKey:'questions.q1.text',options:[['questions.q1.o1',4],['questions.q1.o2',3],['questions.q1.o3',1],['questions.q1.o4',0]]},
  {textKey:'questions.q2.text',options:[['questions.q2.o1',0],['questions.q2.o2',2],['questions.q2.o3',3],['questions.q2.o4',4]]},
  {textKey:'questions.q3.text',options:[['questions.q3.o1',4],['questions.q3.o2',3],['questions.q3.o3',1],['questions.q3.o4',0]]},
  {textKey:'questions.q4.text',options:[['questions.q4.o1',4],['questions.q4.o2',2],['questions.q4.o3',1],['questions.q4.o4',0]]},
  {textKey:'questions.q5.text',options:[['questions.q5.o1',3],['questions.q5.o2',2],['questions.q5.o3',1],['questions.q5.o4',0]]},
  {textKey:'questions.q6.text',options:[['questions.q6.o1',4],['questions.q6.o2',2],['questions.q6.o3',1],['questions.q6.o4',0]]},
  {textKey:'questions.q7.text',options:[['questions.q7.o1',4],['questions.q7.o2',3],['questions.q7.o3',1],['questions.q7.o4',0]]},
  {textKey:'questions.q8.text',options:[['questions.q8.o1',4],['questions.q8.o2',3],['questions.q8.o3',1],['questions.q8.o4',0]]},
  {textKey:'questions.q9.text',options:[['questions.q9.o1',4],['questions.q9.o2',3],['questions.q9.o3',1],['questions.q9.o4',0]]},
  {textKey:'questions.q10.text',options:[['questions.q10.o1',4],['questions.q10.o2',3],['questions.q10.o3',1],['questions.q10.o4',0]]}
];

const RESULTS = [
  {min:-10,max:-5,temp:-8,emoji:'🧊',titleKey:'results.r1.title',subtitleKey:'results.r1.subtitle',color:'#1e3a5f'},
  {min:-4,max:0,temp:-2,emoji:'❄️',titleKey:'results.r2.title',subtitleKey:'results.r2.subtitle',color:'#2d4a7a'},
  {min:1,max:5,temp:3,emoji:'🌧️',titleKey:'results.r3.title',subtitleKey:'results.r3.subtitle',color:'#3d5a80'},
  {min:6,max:10,temp:8,emoji:'🌤️',titleKey:'results.r4.title',subtitleKey:'results.r4.subtitle',color:'#457b9d'},
  {min:11,max:15,temp:13,emoji:'🌸',titleKey:'results.r5.title',subtitleKey:'results.r5.subtitle',color:'#e07a5f'},
  {min:16,max:20,temp:18,emoji:'☀️',titleKey:'results.r6.title',subtitleKey:'results.r6.subtitle',color:'#f4a261'},
  {min:21,max:25,temp:23,emoji:'🌻',titleKey:'results.r7.title',subtitleKey:'results.r7.subtitle',color:'#e76f51'},
  {min:26,max:40,temp:35,emoji:'🔥',titleKey:'results.r8.title',subtitleKey:'results.r8.subtitle',color:'#d62828'}
];

function scoreToTemp(total) { return Math.round(-10 + (total / 40) * 50); }
function getResult(temp) { return RESULTS.find(result => temp >= result.min && temp <= result.max) || RESULTS[RESULTS.length - 1]; }
