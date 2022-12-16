//-------------------------------------------------

var paramsTemplatePost = {
  "method" : "post",
  "contentType": "application/json",
  "headers" : {
    "x-api-user" : habId, 
    "x-api-key" : habToken
  },
  "encoding":false,
  "muteHttpExceptions": true,
}

var paramsTemplateGet = {
  "method" : "get",
  "headers" : {
    "x-api-user" : habId, 
    "x-api-key" : habToken
  },
}  

var hr = webScript + '?';

var tagCalendarEvents ="important";
/*
    for checklist on events the format is 
    
*/
//-------------------------------------------------

var paramsTemplatePost = {
  "method" : "post",
  "contentType": "application/json",
  "headers" : {
    "x-api-user" : habId, 
    "x-api-key" : habToken
  },
  "encoding":false,
  "muteHttpExceptions": true,
}

var paramsTemplateGet = {
  "method" : "get",
  "headers" : {
    "x-api-user" : habId, 
    "x-api-key" : habToken
  },
}  

var hr = webScript + '?';

//-------------------------------------------------

function cronScript() {
  var str;  
  var str1 = '';
  var msg = ' ';
  var originalH = 1000;
  var originalMP = 1000;
  var originalGP = 1000;
  
  
  //----------------- Test from here -------------------    
  var response = UrlFetchApp.fetch("https://habitica.com/api/v3/user", paramsTemplateGet);
  var user = JSON.parse(response);
  var hp = user.data.stats.hp;
  var mp = user.data.stats.mp;
  var gp = user.data.stats.gp;
  originalH = hp; originalMP = mp; originalGP = gp;
  
  //---------------------Health-------------------------------  
  
  /*while (hp < 36 && user.data.stats.gp >26)
  {
    var resp1 = UrlFetchApp.fetch("https://habitica.com/api/v3/user/buy-health-potion", paramsTemplatePost);
    var user1 = JSON.parse(resp1);
    str1 = str1 + 'Bought Health <br>';
    msg = msg + 'Bought HP';
    hp = user1.data.hp;
    Utilities.sleep(2000)
  }*/
  
  //----------------------Cron------------------------------  
  
  UrlFetchApp.fetch("https://habitica.com/api/v3/cron", paramsTemplatePost);
  Utilities.sleep(2000)
  var responsef = UrlFetchApp.fetch("https://habitica.com/api/v3/user", paramsTemplateGet);
  var userf = JSON.parse(responsef);
  
  
  //----------------------Skills------------------------------  
  mp = userf.data.stats.mp;
  for(i = 0;i < 3;i++)
  {
    if (mp > skillMP)
    {
      var resp1 = UrlFetchApp.fetch("https://habitica.com/api/v3/user/class/cast/" + skillName, paramsTemplatePost);
      str1 = str1 + skillName + ' applied<br>';
      mp = mp-skillMP;
      Utilities.sleep(2000)
    }
  }
  
  //-----------------------Armoire-----------------------------  Using 125 as 25 remains for health incase of emergency  
  /*gp = userf.data.stats.gp;
  for(i = 0;i < 2;i++)
  {
    if (gp > 125) 
    {
      var respArm = UrlFetchApp.fetch("https://habitica.com/api/v3/user/buy-armoire", paramsTemplatePost);
      var resultArm = JSON.parse(respArm);

      str1 = str1 + 'Bought Armoire<br>';

      if (resultArm.data.armoire.type == 'food') {
        str1 = str1 + "You gained " + resultArm.data.armoire.dropText + "<br>"
      } else {
        str1 = str1 + "You gained " + resultArm.data.armoire.value + " " + resultArm.data.armoire.type + "<br>"    
      }      
      gp = gp-100;
      Utilities.sleep(2000)
    }
  }*/
  
  //-------------------------Email---------------------------  
  
  var hpR = Math.ceil(userf.data.stats.hp * 10)/10;

  
  str = 'H: '+ hpR + '  E: '+ userf.data.stats.exp + '/' + userf.data.stats.toNextLevel + 
    '  M: '+ Math.floor(mp) + '/'+ userf.data.stats.maxMP + 
    '  L: '+ userf.data.stats.lvl + ' ' + msg;
  
  str1 = str1 + 'Health Delta = ' + Math.floor(hpR - originalH) + '<br>' +
    'Mana Delta = ' + Math.floor(mp - originalMP) + '<br>' +
    'Gold Delta = ' + Math.floor(gp - originalGP) + '<br>' +
  //  'Buffed Per = ' + userf.data.stats.buffs.per + '<br>' +
    'GP = ' + Math.floor(userf.data.stats.gp) + '<br>' +
    'Points = ' + userf.data.stats.points + '<br>' ;
  
  var mailBody = str1 + '<br><a href="' + hr + 'display">Habitica Dashboard</a><br><br>HabiticaTasksMail'
  
  
  MailApp.sendEmail({
    to: emailID,
    name: "Stats",
    subject: str,
    htmlBody: mailBody
  });
  
}

/*----------------------------------------------------------
------------------------statsEmail--------------------------
----------------------------------------------------------*/

function statsEmail() {
  var responsef = UrlFetchApp.fetch("https://habitica.com/api/v3/user", paramsTemplateGet);
  var userf = JSON.parse(responsef);
  
  var hpR = Math.ceil(userf.data.stats.hp * 10)/10;

  var str = 'H: '+ hpR + '  E: '+ userf.data.stats.exp + '/' + userf.data.stats.toNextLevel + 
    '  M: '+ Math.floor(userf.data.stats.mp) + '/'+ userf.data.stats.maxMP + 
    '  L: '+ userf.data.stats.lvl + ' ' + 
    '  G: '+ Math.floor(userf.data.stats.gp) + ' ';
  
  var mailBody = '<br><a href="' + hr + 'display">Habitica Dashboard</a><br><br>HabiticaTasksMail'
  
  
  MailApp.sendEmail({
    to: emailID,
    name: "Stats",
    subject: str,
    htmlBody: mailBody
  });
}

/*----------------------------------------------------------
------------------------todoFromGCal------------------------
----------------------------------------------------------*/
  

function todoFromGcal() {
  
  var now = new Date();
  var events = CalendarApp.getCalendarsByName("HabiticaReminders")[0].getEventsForDay(now);
  var tagId = getCalendarEventTagId();
  for (i = 0; i < events.length; i++) {
    var params = paramsTemplatePost;
    var priority = "1"; 
    
    const checkObj = fillChecklist(events[i].getDescription());
    let checklist = checkObj[0];
    let description = checkObj[1];

    Logger.log("description: " + events[i].getDescription());
   
    Logger.log(checklist);

    if (events[i].getTitle().toLowerCase() == "w" || events[i].getTitle() == "") {
     // createMiniTodo(now);
      checklist = [{"text":"[list for work preparedness](https://keep.google.com/#LIST/1OcJJQDA23BG2ivBHPStqjUjNJ5flVU4_3ysDsakK-Z0ranKjstMLLNXWHHOViQ-aM_e0)"},
                   {"text":"am i early"},
                   {"text":"no complaints"},
                   {"text":"[list for work completeness](https://keep.google.com/#LIST/1Gswp_OhGoyaj_3wgq3Sggqwd8t97DnH1_l9nXmfq1ablw0nLlal1TYNVRRmRV-CHQ_5V)"},
                   {"text":"did i get out before 10:30"}];
      if (events[i].getEndTime().getHours() - events[i].getStartTime().getHours() >= 6) {
        checklist.push({"text":"6hr bonus", "completed": true});
      }
       if (events[i].getEndTime().getHours() - events[i].getStartTime().getHours() >= 9){
        checklist.push({"text":"9hr bonus", "completed": true});
         checklist.push({"text":"9hr bonus+", "completed": true});
      }
    }
 
    params["payload"] = Utilities.newBlob(JSON.stringify({
      "text" : events[i].getTitle() + " - " + now.toLocaleDateString(), 
      "type" : "todo",
      "priority" : priority,
      "date":  events[i].getEndTime().toISOString(),
      "notes" : "starts at: " + events[i].getStartTime().toLocaleTimeString() + "\n ends at: " + 
      events[i].getEndTime().toLocaleTimeString() + "\n\n" + description,
      "checklist": checklist,
      "tags":[tagId],
      
  }),"application/json");
    //Logger.log(JSON.stringify(params));
    try {
      var response = UrlFetchApp.fetch("https://habitica.com/api/v3/tasks/user", params);
      //Logger.log(response.getContentText()); 
    } catch(e) {
     //Logger.log(e.stack);
    }
 
  }
}
function getCalendarEventTagId(){

  var response = (JSON.parse(UrlFetchApp.fetch("https://habitica.com/api/v3/tags", paramsTemplateGet))).data
  var id = response.find(function(tag){ return tag.name == tagCalendarEvents;}).id;

  return id;


}
function fillChecklist(description){
    
    const searchTerm = "checklist:";
    let checklistArray = [];
    let result = description.lastIndexOf(searchTerm);
    //the rest of the code in the if!!
    let newDescription = description;
    if (result !== -1){
      Logger.log("we have a match!");
      let sub = description.substring(result+searchTerm.length);
      Logger.log(sub);
      //remove first element and convert each item seperated by dashes to be checklist item.
      checklistArray = sub.split("-").map(function(s){ return {"text" : s.replace("<br>","")};}).slice(1); 
      newDescription = description.substring(0,result);
    
    } 
    return [checklistArray,newDescription];
}

/*----------------------------------------------------------
------------------------tasksAsEmail------------------------
----------------------------------------------------------*/



function todoAsEmail() {
  
  var response = UrlFetchApp.fetch("https://habitica.com/api/v3/tasks/user", paramsTemplateGet);
  var tasks = JSON.parse(response);
  
  for(var i = 0; i < tasks.data.length; i++){
    if (tasks.data[i].type == 'todo') {
      
      var mailBody = 'HabiticaTasksMail <a href="' + hr + 'U' + tasks.data[i].id + '">Completed</a>'  
      
      MailApp.sendEmail({
        to: emailID,
        name: "ToDo: " + tasks.data[i].text,
        subject: "ToDo: " + tasks.data[i].text,
        htmlBody: mailBody
      });
      
      Utilities.sleep(2000)    
    }
  }
  
  // Purging old emails
 
  var search = "HabiticaTasksMail older_than:1d label:inbox"; // is:unread" 
  
  var threads = GmailApp.search(search, 0, 100);
  
  for (var i=0; i<threads.length; i++) {
    threads[i].moveToArchive();
  }
}


/*----------------------------------------------------------
------------------------WebApp------------------------------
----------------------------------------------------------*/

function doGet(e)
{
 
  var response;
  var strResponse;
  
  if (e.queryString == '' || e.queryString == 'display')
  {
    strResponse = 'Welcome !!';
    
  }

//-------------------------------------------------
  
  else if (e.queryString == 'sleep')
  {

    response = UrlFetchApp.fetch('https://habitica.com/api/v3/user/sleep', paramsTemplatePost);
    var result = JSON.parse(response);
    if (result.data == true) {
      strResponse = 'You are resting in the Tavern' }
    if (result.data == false) {
      strResponse = 'You have left the Tavern and are ACTIVE' }
      
      } 
      
//-------------------------------------------------
  
  else {
    
    var taskId = e.queryString;
    
    if (taskId.charAt(0) == 'U') {
      response = UrlFetchApp.fetch('https://habitica.com/api/v3/tasks/' + taskId.slice(1) + '/score/up', paramsTemplatePost);
    }
    else {
      response = UrlFetchApp.fetch('https://habitica.com/api/v3/tasks/' + taskId.slice(1) + '/score/down', paramsTemplatePost);
    }
    
    var result = JSON.parse(response);
    if (result.success == true) 
    {strResponse = 'Success !!'}
    else {strResponse = 'ERROR'}
              
    if (result.data._tmp.drop != null) 
    {strResponse = strResponse + '\t  ' + result.data._tmp.drop.dialog}

  }

//-------------------------------------------------
  
  
  response = UrlFetchApp.fetch("https://habitica.com/api/v3/user", paramsTemplateGet);
  var user = JSON.parse(response);
  var str = '<b>'+ strResponse + 
    '</b> <br><br>Health: '+ Math.floor(user.data.stats.hp) + 
    '<br>Exp: &nbsp&nbsp&nbsp'+ Math.floor(user.data.stats.exp) + '/' + user.data.stats.toNextLevel + 
    '<br>Mana: &nbsp'+ Math.floor(user.data.stats.mp) + '/' + user.data.stats.maxMP + 
    '<br>Level: &nbsp'+ user.data.stats.lvl + 
    '<br>Sleep: &nbsp' + user.data.preferences.sleep

  var newDate = Date();
  var result = Utilities.formatDate(new Date(), Session.getScriptTimeZone(),  "MMM d yyyy HH:mm:ss") + '<br><br>Daily List:  ';

  str = str + ' <a href="'+ hr + 'sleep">(Toggle)</a> <br><br><p>' + result + '</p>';

  var response = UrlFetchApp.fetch("https://habitica.com/api/v3/tasks/user", paramsTemplateGet);
  var tasks = JSON.parse(response);
  
//----------------------------------------------------------
  
  for(var i = 0; i < tasks.data.length; i++){
    if (tasks.data[i].type == 'daily' && tasks.data[i].completed == false) {
      str = str + '\n<li><a href="' + hr + 'U' + tasks.data[i].id + '">' + tasks.data[i].text + ' (' + tasks.data[i].streak + ')</a></li>'
    }
  }
  
  str = str + '<br><br><p>' + 'ToDo List' + '</p>';

  for(var i = 0; i < tasks.data.length; i++){
    if (tasks.data[i].type == 'todo') {
      str = str + '\n<li><a href="' + hr + 'U' + tasks.data[i].id + '">' + tasks.data[i].text + '</a></li>'
    }
  }
  
  str = str + '<br><br><p>' + 'Habit List' + '</p>';
  
  for(var i = 0; i < tasks.data.length; i++){
    if (tasks.data[i].type == 'habit') {
      str = str + '\n<li>(<a href="' + hr + 'U' + tasks.data[i].id + '">Up</a> / <a href="' + hr + 'D' + tasks.data[i].id + '">Down</a>)  ' + 
        '<a href="' + hr + 'U' + tasks.data[i].id + '">' + tasks.data[i].text + '</a></li>'
      
    }
  }
    
  var template1 = '<!DOCTYPE html>\n<html>\n  <head>\n    <base target="_top">\n  <\head>\n  <body>\n';
  var template2 = '\n</body>\n</html>';
  return HtmlService.createHtmlOutput(template1+str+template2) 
  
}
