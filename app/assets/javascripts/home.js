$(function(){
  // 関連コンテンツ クリック時のイベントのバインド
  $("#related-list").on("click", ".related-content", function(e) {
    addContent($(this).data("videoid"), $(this).find(".title").text());
  });

  // 再生中リスト クリック時のイベントのバインド
  $("#around-list").on("click", ".around-content", function(e) {
    show($(this).data("playorder"));
  });

  // 再生中リスト 削除ボタン
  $("#around-list").on("click", ".remove", function(e) {
    destroy($(this).parent("li").data("playorder"));
  });

  // URLによるコンテンツ追加処理
  $("#addByUrl").click(function() {
    var url = $("#newContentUrl").val();
    // URL文字列をパースしてIDを抽出
    var regexp = /[/=]([-\w]{11})/;
    var content_id = regexp.exec(url)[1]

    // APIからタイトルを取得
    $.ajax({
      type: "GET",
      dataType: "json",
      url: "http://gdata.youtube.com/feeds/api/videos/" + content_id + "?alt=json",
      success: function(result) {
        addContent(content_id, result.entry.title.$t);
      },
      error: function(result) {
        console.log("error add content by url.");
      }
    });
  });

});

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var play_order = 0;
var current_order = 5;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onPlaybackQualityChange': onPlaybackQualityChange
    }
  });
}
function onPlayerReady(event) {
  updateAroundList();
  show(current_order);
  // updateRelated();
  // updateAroundList();
}

function onPlayerStateChange(event) {
  console.log(event.data);
  switch (event.data) {
    case YT.PlayerState.PLAYING:
      player.setPlaybackQuality("hd1080"); // 動いてない
      break;
    case YT.PlayerState.ENDED:
      console.log("end");
      playNextContent();
      break;
  }
}

function onPlaybackQualityChange(event) {
  console.log("onPlaybackQualityChange:" + event.data);
}

function playNextContent() {
  $.ajax({
    type: "GET",
    url: "/next",
    data: {
      current_order: current_order
    },
    success: playNewContent,
    error: error
  });
}

function playPrevContent() {
  $.ajax({
    type: "GET",
    url: "/prev",
    data: {
      current_order: current_order
    },
    success: playNewContent,
    error: error
  });
}

function playNewContent(result) {
  current_order = result.play_order;
  updateRelated(result.content_id);
  updateAroundList();
  player.loadVideoById({
    videoId: result.content_id
  });
}

function error(result) {
  console.log("error");
  console.log(result);
}


function show(play_order) {
  console.log("show: " + play_order);
  $.ajax({
    type: "GET",
    url: "/show",
    data: {
      play_order: play_order
    },
    dataType: "json",
    success: playNewContent,
    error: error
  });
}

function reset() {
  $.ajax({
    type: "GET",
    url: "/reset",
    dataType: "json",
    success: function(result) {
      updateRelated();
      updateAroundList();
    }
  });
}

// プレイリストの最後尾にコンテンツを追加する
function addContent(content_id, title) {
  $.ajax({
    type: "GET",
    url: "/add",
    data: {
      content_id: content_id,
      title: title
    },
    dataType: "json",
    success: function(result) {
      updateAroundList();
    }
  });
}

function destroy(play_order) {
  console.log("destroy: " + play_order);
  $.ajax({
    type: "POST",
    url: "/destroy/",
    data: {
      play_order: play_order
    },
    dataType: "json",
    success: function(result) {
      updateRelated();
      updateAroundList();
    }
  });
}

// 関連動画の読み込みと更新
function updateRelated(video_id) {
  console.log("update related: " + player.getVideoData().video_id );
  $.ajax({
    type: "GET",
    dataType: "json",
    url: "http://gdata.youtube.com/feeds/api/videos/" + video_id + "/related?v=2&alt=json",
    success: function(result) {
      var html = "";
      // オブジェクトを作ってみる？
      var template = _.template($("#related-content-template").html());
      var target = $("#related-list");
      target.html("");
      for (var i = 0; i < result.feed.entry.length; i++) {
        target.append(template({
          title: result.feed.entry[i].title.$t,
          video_id: result.feed.entry[i].media$group.yt$videoid.$t,
          image_url: result.feed.entry[i].media$group.media$thumbnail[0].url,
        }));
      }
    },
    error: function(result) {
      console.log("error update related.");
    }
  });
}

// 再生中のリストを更新する TODO Aroundという名前が微妙
function updateAroundList() {
  $.ajax({
    type: "GET",
    url: "/around",
    data: {
      current_order: current_order
    },
    dataType: "json",
    success: function(result) {
      // 再生中のプレイリストを書き換え
      var template = _.template($("#around-content-template").html());
      var target = $("#around-list");
      target.html("");

      for (var i = 0; i < result.length; i++) {
        target.append(template(result[i]));
      }

      setCurrent();
    }
  });
}

// 再生中リストの現在再生中のものにクラスをつける
function setCurrent() {
  $("#around-list > li").removeClass("current");
  $("#around-list > li[data-playorder=\"" + current_order + "\"]").addClass("current");
}
