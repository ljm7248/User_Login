var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var auth = require('../lib/auth');
var db = require('../lib/db');
var shortid = require('shortid');


router.get('/create', function (request, response) {
  if (!auth.isOwner(request, response)) {
    response.redirect('/');
    return false;
  }
  var title = 'WEB - create';
  var list = template.list(request.list);
  var html = template.HTML(title, list, `
      <form action="/topic/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '', auth.statusUI(request, response));
  response.send(html);
});

router.post('/create_process', function (request, response) {
  console.log('create_process');
  if (!auth.isOwner(request, response)) {
    response.redirect('/');
    return false;
  }
  var post = request.body;
  var title = post.title;
  var description = post.description;
  //db로 관리
  var id = shortid.generate();
  db.get('topics').push({
    id:id,
    title:title,
    description:description,
    user_id:request.user.id
  }).write();
  response.redirect(`/topic/${id}`);
  /* 예전소스. 파일로 관리한 소스
  fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
    response.redirect(`/topic/${title}`);
  */
});


//유저가 글 업데이트 하는 부분
router.get('/update/:pageId', function (request, response) {
  if (!auth.isOwner(request, response)) {
    response.redirect('/');
    return false;
  }
  //pagdid는 topics의 id를 의미함

  var topic = db.get('topics').find({id:request.params.pageId}).value();

  //로그인한 유저와 글을 수정한 사람을 혹시나 몰라서 한번 체크한다.
  if(topic.user_id!==request.user.id)
  {
    request.flash('error', 'Not yours!');
    console.log('error');
    return response.redirect('/');
    
  }


    var title = topic.title;
    var description = topic.description;
    var list = template.list(request.list);
    var html = template.HTML(title, list,
      `
        <form action="/topic/update_process" method="post">
          <input type="hidden" name="id" value="${topic.id}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
      `<a href="/topic/create">create</a> <a href="/topic/update/${topic.id}">update</a>`,
      auth.statusUI(request, response)
    );
    response.send(html);
  
});

router.post('/update_process', function (request, response) {
  if (!auth.isOwner(request, response)) {
    response.redirect('/');
    return false;
  }
  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;

  var topic = db.get('topics').find({id:id}).value();

  console.log(topic);

  //로그인한 유저와 글을 수정한 사람을 혹시나 몰라서 한번 체크한다.
  if(topic.user_id!==request.user.id)
  {
    request.flash('error', 'Not yours!');
    console.log('error');
    return response.redirect('/');
    
  }

  db.get('topics').find({id:id}).assign({
    title:title,
    description:description
  }).write();
  response.redirect(`/topic/${topic.id}`);

  /*
  fs.rename(`data/${id}`, `data/${title}`, function (error) {
    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
      response.redirect(`/topic/${title}`);
    })
  });
  */
});

router.post('/delete_process', function (request, response) {
  if (!auth.isOwner(request, response)) {
    response.redirect('/');
    return false;
  }
  var post = request.body;
  var id = post.id;

  var topic = db.get('topics').find({id:id}).value();
  if(topic.user_id!==request.user.id)
  {
    request.flash('error', 'Not yours!');
    console.log('error');
    return response.redirect('/');
    
  }

  db.get('topics').remove({id:id}).write();
  response.redirect('/');
  /*
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function (error) {
    
  });
  */
});

router.get('/:pageId', function (request, response, next) {
  console.log(':pageid  ', request.params.pageId);

  var filteredId = path.parse(request.params.pageId).base;
  var topic = db.get('topics').find({
    id:request.params.pageId
  }).value();

  var user = db.get('users').find({
    id:topic.user_id
  }).value();


  console.log(topic);

  var sanitizedTitle = sanitizeHtml(topic.title);
  var sanitizedDescription = sanitizeHtml(topic.description, {
    allowedTags: ['h1']
  });
  var list = template.list(request.list);
  var html = template.HTML(sanitizedTitle, list,
    `<h2>${sanitizedTitle}</h2>
    ${sanitizedDescription}
    <p>by ${user.displyName}</p>
    `,
    ` <a href="/topic/create">create</a>
        <a href="/topic/update/${topic.id}">update</a>
        <form action="/topic/delete_process" method="post">
          <input type="hidden" name="id" value="${topic.id}">
          <input type="submit" value="delete">
        </form>`,
    auth.statusUI(request, response)
  );  
  response.send(html);
  //기존에 파일 읽어 오는 소스 우리는 lowdb로 바꿈.
  /*
  //fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
    if (err) {
      next(err);
    } else {
      var title = request.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ['h1']
      });
      var list = template.list(request.list);
      var html = template.HTML(sanitizedTitle, list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/topic/create">create</a>
            <a href="/topic/update/${sanitizedTitle}">update</a>
            <form action="/topic/delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>`,
        auth.statusUI(request, response)
      );
      response.send(html);
    }
  });//*/
});
module.exports = router;