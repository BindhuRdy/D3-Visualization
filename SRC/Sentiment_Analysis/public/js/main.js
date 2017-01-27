$(function(){
	////////////////////////////////////////////////////////////////////////////////////////

	// This is called with the results from from FB.getLoginStatus().
	function statusChangeCallback(response) {
		console.log('statusChangeCallback');
		console.log(response);
		// The response object is returned with a status field that lets the
		// app know the current login status of the person.
		// Full docs on the response object can be found in the documentation
		// for FB.getLoginStatus().
		if (response.status === 'connected') {
		  // Logged into your app and Facebook.
		  $("#fblogin").hide();
		  $("#fbdetailsblock").show();
		  testAPI();
		} else if (response.status === 'not_authorized') {
		  // The person is logged into Facebook, but not your app.
		  $("#status").html('Please log into this app.');
		} else {
		  // The person is not logged into Facebook, so we're not sure if
		  // they are logged into this app or not.
		  $("#status").html('Please log into Facebook.');
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////

	// This function is called when someone finishes with the Login
	// Button.  See the onlogin handler attached to it in the sample
	// code below.
	window.checkLoginState = function() {
		FB.getLoginStatus(function(response) {
		  statusChangeCallback(response);
		});
	}

	////////////////////////////////////////////////////////////////////////////////////////

	window.fbAsyncInit = function() {
		FB.init({
			  appId      : '266301227044243',
			  xfbml      : true,
			  version    : 'v2.6'
		});

		FB.getLoginStatus(function(response) {
			  statusChangeCallback(response);
		});
	};

	////////////////////////////////////////////////////////////////////////////////////////

	(function(d, s, id){
		 var js, fjs = d.getElementsByTagName(s)[0];
		 if (d.getElementById(id)) {return;}
		 js = d.createElement(s); js.id = id;
		 js.src = "//connect.facebook.net/en_US/sdk.js";
		 fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));

	////////////////////////////////////////////////////////////////////////////////////////

	var totalFBPostsCount = 0;
    var in_daterange = true;
	var shouldAnimate = true;
    var sent_results =[];
    var cities = [];
    var nodes = [], links = [], graph_data ={"nodes":[],"links":[]};
    
    var col_codes = ["#008000", "#FF0000", "#808080"];
    var emotype_cat = [{"name":'pos',count:0},
                        {"name":'neg',count:0},
                        {"name":'neutral',count:0}
                       ];
    
    var emotion_cat = [{"name":'Excitement',count:0,likes:0,img_url:'excitement.png'},
                            {"name":'Joy',count:0,likes:0,img_url:'joy.png'},
                            {"name":'Love',count:0,likes:0,img_url:'love.jpg'},
                            {"name":'Happy',count:0,likes:0,img_url:'happy.png'},
                            {"name":'Awe',count:0,likes:0,img_url:'awe.png'},
                            {"name":'Compassion',count:0,likes:0,img_url:'compassion.png'},
                            {"name":'Relief',count:0,likes:0,img_url:'Relief.png'},
                            {"name":'Sadness',count:0,likes:0,img_url:'Sad.jpg'},
                            {"name":'Grief',count:0,likes:0,img_url:'grief.png'},
                            {"name":'Disgust',count:0,likes:0,img_url:'disgust.jpg'},
                            {"name":'Frustation',count:0,likes:0,img_url:'anger.png'},
                            {"name":'Fear',count:0,likes:0,img_url:'Fear.png'},
                            {"name":'Anger',count:0,likes:0,img_url:'anger.png'},
                            {"name":'neutral',count:0,likes:0,img_url:'neutral.jpg'}
                       ];
    var emonames = ['Excitement','Joy','Love','Happy','Awe','Compassion','Relief','Sadness','Grief','Disgust','Frustation','Fear','Anger','neutral']
	function renderFBPosts(response){
        
        var pos_emo_list = [{"name":'Excitement',"u_limit":100,"l_limit":75},
                            {"name":'Joy',"u_limit":75,"l_limit":70},
                            {"name":'Love',"u_limit":70,"l_limit":60},
                            {"name":'Happy',"u_limit":60,"l_limit":50},
                            {"name":'Awe',"u_limit":50,"l_limit":45},
                            {"name":'Compassion',"u_limit":45,"l_limit":40},
                            {"name":'Relief',"u_limit":40,"l_limit":0},
                            
        ];
        var neg_emo_list = [{"name":'Sadness',"u_limit":100,"l_limit":75},
                            {"name":'Grief',"u_limit":75,"l_limit":60},
                            {"name":'Disgust',"u_limit":60,"l_limit":55},
                            {"name":'Frustation',"u_limit":55,"l_limit":50},
                            {"name":'Fear',"u_limit":50,"l_limit":40},
                            {"name":'Anger',"u_limit":40,"l_limit":0}
        ];
        
		
		$(".progress").show();
		
		(function animateProgressBar(){
			console.info("hello");
			$("#progressbar").css({width: "0%"}).animate({width: "100%"}, 50, function(){if(shouldAnimate)animateProgressBar();});
		})();
		
		$.each(response.data, function(index, item){
            
			if(item.place){
                //testing
            }
			if(!item.message){
				return;
            }
			
            var datestart = new Date($( "#slider-range" ).slider( "values", 0 )*1000);
            var dateend = new Date($( "#slider-range" ).slider( "values", 1)*1000);
			var create_date = new Date(item.created_time);
            if(create_date.getTime() > datestart.getTime() && create_date.getTime() < dateend.getTime()){
                //alert("yes im in range");
                totalFBPostsCount++;
            //}
			/*var $liItem = $("<li class='list-group-item'>"
				+"<span>"+item.message+"</span>"
				+"<div>...analyzing...</div>"
			+"</li>").appendTo("ul#posts");*/
            
			
			$.post(
					"/sentiment_1",
					"text="+item.message,
					function(sData){
						console.info(sData);
                        var elem, list_emo, pos_prop, neg_prop, prop_comp, emoelem;
                        //fetch likes
                        var likes_data;
                        sData.likes = 0;
                        pos_prop = sData.probability.pos *100;
                        neg_prop = sData.probability.neg *100;
                        var emo_type = sData.label;
                        //counting posts for emotion types
                        for(emoelem in emotype_cat ){
                                        if(emotype_cat[emoelem].name == sData.label){
                                            var cur_count = emotype_cat[emoelem].count;
                                            emotype_cat[emoelem].count = cur_count+1;
                                        }
                                    }
                        if(emo_type =='pos'){ 
                            list_emo = pos_emo_list;
                            prop_comp = pos_prop;
                            
                        }
                        else if(emo_type == 'neg'){ 
                            list_emo = neg_emo_list;
                            prop_comp = neg_prop;
                        }
                        if(!(sData.label == 'neutral')){
                            for(elem in list_emo ){
                                
                                if(prop_comp <= list_emo[elem].u_limit && prop_comp >= list_emo[elem].l_limit){
                                    sData.emotion = list_emo[elem].name;
                                    for(emoelem in emotion_cat ){
                                        if(emotion_cat[emoelem].name == sData.emotion){
                                            var cur_count = emotion_cat[emoelem].count;
                                            emotion_cat[emoelem].count = cur_count+1;
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            sData.emotion = 'neutral';
                        }
                        //testing location
                        FB.api(
			            "/"+item.id+"/place",
			            function (response) {
			              if (response && !response.error) {
                              alert(resonse.data);
                              test_places(response);
                          }
                        });
                        FB.api(
			            "/"+item.id+"/likes?summary=true",
			            function (response) {
			              if (response && !response.error) {
				          //likes_data = response.data;
                           sData.likes = response.summary.total_count;
                           console.log("likes:"+sData.likes)
                           var emolem;
                           for(emoelem in emotion_cat){
                                        if(emotion_cat[emoelem].name == sData.emotion){
                                            var cur_count = emotion_cat[emoelem].likes;
                                            emotion_cat[emoelem].likes = cur_count+sData.likes;
                                        }
                            }
                           update_sent_results(sData,item);
			              }
			            }
		                );
                        
                        
                        //sent_results.push({"Emotion_Type":sData.label,"Emotion":sData.emotion,"Likes":sData.likes});
                         
						/*$liItem.find("div").html(
													  "<br> emotion type : " + sData.label
                                                    + "<br> emotion  : " + sData.emotion
													+ "<br> - : " + sData.probability.neg
													+ "<br> ~ : " + sData.probability.neutral
													+ "<br> + : " + sData.probability.pos
                                                    + "<br> Likes : " + sData.likes 
												);*/
					}
			);
        }//date range if close
        
		});
		
		if(( totalFBPostsCount < 50) && response.paging && response.paging.next && (response.paging.next != "")){ //fetch the next set of fb posts, if the total number of fb posts till now is less than 100
			setTimeout(function(){
				$.get(response.paging.next,renderFBPosts);
			}, 10);
		} else {
			shouldAnimate = false;
            console.log(emotion_cat);
            console.log(emotype_cat);
            //localStorage.setItem('EmotionTypes', JSON.stringify(emotype_cat));
            //emotype_cat = filterdata_obj(emotype_cat);
            //draw_donut(emotype_cat,col_codes);
            //var likes_data = [];
            //var count_data = [];
            //count_data =  filterdata_obj_count(emotion_cat);
            //likes_data = filterdata_obj_likes(emotion_cat);
            //draw_donut(count_data,null);
            //draw_bubble(likes_data);
             //nodes = compute_nodes();
             //links = compute_links();
             //graph_data = {"nodes":nodes,"links":links};
             //graph_data.push({"nodes":nodes,"links":links});
            //draw_weightedgraph(nodes,links);
            //determin_emotion();
            
            //testdonut(emotion_cat);
		}
        
	}
    //filter json object to remove empty entries
    function filterdata_obj_count(data){
        var dataelem,i=0,d_new=[];
        for(dataelem in data ){
                                        if(data[dataelem].count != 0){
                                            d_new.push({"name":data[dataelem].name,"count":data[dataelem].count});
                                            
                                        }
                                    }
         return d_new;                           
    }
    function filterdata_obj_likes(data){
        var dataelem,i=0,d_new=[];
        for(dataelem in data ){
                                        if(data[dataelem].likes != 0){
                                            d_new.push({"name":data[dataelem].name,"likes":data[dataelem].likes});
                                            
                                        }
                                    }
         return d_new;                           
    }
    //function to update json sentiment results
 
    function update_sent_results(sData,item){
        sent_results.push({"timestamp":item.created_time,"message":item.message,"Emotion_Type":sData.label,"Emotion":sData.emotion,"Likes":sData.likes,"time_stamp":item.created_time,"story":item.story,"id":item.id});
        //return sent_results;
    }
    //function for nodes computation
    function compute_nodes(){
        
        var  index, i=0;
         for(index in sent_results ){
             var emo = emonames.indexOf(sent_results[index].Emotion);
             nodes.push({"message":sent_results[index].message,"emotion":emo,"likes":sent_results[index].Likes});
         }
        return nodes;
        
    }
    function compute_links(){
        var  i,j, src=0,des =0;
        for(i in sent_results){
            for(j in sent_results){
                
                
                if(i!=j){
                var emo_1 = sent_results[i].Emotion;
                var emo_2 = sent_results[j].Emotion;
                var like_1 = sent_results[i].Likes;
                var like_2 = sent_results[j].Likes;
                if( (like_1!=0 && like_2 !=0 && Math.abs(like_1-like_2) == 0)|| emo_1 == emo_2){
                    var emo = emonames.indexOf(sent_results[j].Emotion);
                    links.push({"source":src,"target":des,"values":1,"group":emo});
                }
                }
                   des++;
            }
            des=0;
            src++;
        }
        return links;
    }
    //emotion computation
    function determin_emotion(){
        var emoelem;
        var max = 0;
        var index = 0;
        for(emoelem in emotion_cat ){
            if(max < emotion_cat[emoelem].count){
               index = emoelem;
               max = emotion_cat[emoelem].count;               
            }
        var my_emotion = emotion_cat[index].name;
       
        }
         //alert("emotion"+my_emotion+"count"+max);
         return my_emotion;
        
    }
    
    //function  draw weighted graph
    function draw_weightedgraph(f_nodes,f_links){
    var width = 600,
    height = 350;

var color = d3.scale.category20c();

var force = d3.layout.force()
    .charge(-30)
    .linkDistance(140)
    .size([width, height]);

var prev_body = d3.select("ul.list-group").select("svg").remove();
 var prev_body = d3.select("ul.list-group").select("div").remove();
var svg = d3.select("ul.list-group").append("svg")
    .attr("width", width)
    .attr("height", height);
var nodesmap = d3.nest()
					.key(function(d,i) { return ''+i+d.message; })
					.rollup(function(d) { return {"message":d[0].message, "emotion":d[0].emotion ,"likes":d[0].likes}; } )
					.map(f_nodes);
					
	f_nodes = d3.keys(d3.nest()
                             .key(function (d,i) { return ''+i+d.message; })
                             .map(f_nodes));
   f_nodes.forEach(function (d,i) {f_nodes[i]={ "name": nodesmap[d].message, "group": nodesmap[d].emotion ,"likes":nodesmap[d].likes };})

/* var graph = { "nodes": [], "links": [] };
       nodes.forEach(function (d) {
            graph.nodes.push({ "message": d.message, "emotion": d.emotion });
        });
        links.forEach(function (d) {
            graph.links.push({ "source": d.source, "target": d.target, "values": +d.values });
        }); */
debugger;

  force
      .nodes(f_nodes)
      .links(f_links)
      .start();

  var link = svg.selectAll(".link")
      .data(f_links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke", function(d) { return color(d.group); })
      .style("stroke-width", function(d) { return Math.sqrt(d.values); });
  color = d3.scale.category20();
  var node = svg.selectAll(".node")
      .data(f_nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", function(d) { return (d.likes/8)+8; })
      .style("fill", function(d) { return color(d.group); })
      .call(force.drag);

  node.append("title")
      .text(function(d) { return d.name; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
        
  });
  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.data(emotion_cat).append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d.name; });
  
    }
    //function draw bubble chart
    function draw_bubble(data){
        var width = 300;
        var diameter = 400; //max size of the bubbles
  var  color   = d3.scale.category10(); //color category

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);
var prev_body = d3.select("ul.list-group").select("svg").remove();
 var prev_body = d3.select("ul.list-group").select("div").remove();
var svg = d3.select("ul.list-group").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");


    //convert numerical values from strings to numbers
    data = data.map(function(d){ d.value = +d.likes; return d; });

    //bubbles needs very specific format, convert data to this.
    var nodes = bubble.nodes({children:data}).filter(function(d) { return !d.children; });

    //setup the chart
    var bubbles = svg.append("g")
        .attr("transform", "translate(0,0)")
        .selectAll(".bubble")
        .data(nodes)
        .enter();

    //create the bubbles
    bubbles.append("circle")
        .attr("r", function(d){ return d.r; })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .style("fill", function(d) { return color((d.value)*2); });

    //format the text for each bubble
    bubbles.append("text")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y + 5; })
        .attr("text-anchor", "middle")
        .text(function(d){ return d.name; })
        .style({
            "fill":"white", 
            "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
            "font-size": "12px"
        });
   var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", diameter-10)
      .attr("width", 12)
      .attr("height", 12)
      .style("fill", color);

  legend.data(emotion_cat).append("text")
      .attr("x", diameter-15)
      .attr("y", 7)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d.name; });
  
    
        
    }
    //function to draw emojis
    function draw_emoji(emo)
    
    { 
    
             var emo_index = emonames.indexOf(emo);
             var img_url = emotion_cat[emo_index].img_url;
         var prev_body = d3.select("ul.list-group").select("svg").remove();
         var prev_body = d3.select("ul.list-group").select("div").remove();
        var width = 800,height = 250;
       // <img src="smiley.gif" alt="Smiley face" >
        var svg = d3.select("ul.list-group").append("div")
    .attr("width", width)
    .attr("height", height)
    .attr("id","svg");
    $('#svg').append('<img src= img/'+img_url+' title='+emo+' width="400" height="400" >');
    
    
    }
    
    //function to draw donut chart
    
function draw_donut(data,col_codes){
   
var width = 600,
    height = 250,
    radius = Math.min(width, height) / 2,
    labelr = radius + 10;
var key = function(d){ return d.data.name; };
if(col_codes==null){
    col_codes =["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"];
}
var color = d3.scale.ordinal()
    .range(col_codes);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 70);

var pie = d3.layout.pie()
    .sort(null)
    .value(function (d) {
    return d.count;
});

var prev_body = d3.select("ul.list-group").select("svg").remove();
 var prev_body = d3.select("ul.list-group").select("div").remove();
var svg = d3.select("ul.list-group").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function (d) {
        return color(d.data.name);
    });

    /* g.append("text")
        .attr("transform", function (d) {
        return "translate(" + arc.centroid(d) + ")";
    })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function (d) {
        return d.data.name;
    }); */
   g.append("svg:text")
    .attr("transform", function(d) {
        var c = arc.centroid(d),
            x = c[0],
            y = c[1],
            // pythagorean theorem for hypotenuse
            h = Math.sqrt(x*x + y*y);
        return "translate(" + (x/h * labelr) +  ',' +
           (y/h * labelr) +  ")"; 
    })
    .attr("dy", ".35em")
    .attr("text-anchor", function(d) {
        // are we past the center?
        return (d.endAngle + d.startAngle)/2 > Math.PI ?
            "end" : "start";
    })
    .text(function(d, i) { return d.data.name; });
        
    }
	////////////////////////////////////////////////////////////////////////////////////////

	// Here we run a very simple test of the Graph API after login is
	// successful.  See statusChangeCallback() for when this call is made.
	function testAPI() {
		console.log('Welcome!  Fetching your information.... ');
		
		FB.api('/me', function(response) {
			if (response && !response.error) {
				console.log('Successful login for: ' + response.name);
				$("#status").html('Thanks for logging in, ' + response.name + '!');
			}
		});
	}
    
    function test_places(response){
       $.each(response.data, function(index, item){
                      if(item.place)
                      {
                          alert("place"+item.place.city);
                          cities.push({"name":item.place.city});
                      }
                  });
    }

	////////////////////////////////////////////////////////////////////////////////////////
	
	$("button#fetcher").click(function(){
        var date_since = $( "#slider-range" ).slider( "values", 0 )*1000;
            var date_until= $( "#slider-range" ).slider( "values", 1)*1000;
        
        /*FB.api(
			"/me/feed?feilds=place",
			function (response_t) {
			  if (response_t && !response_t) {
                  test_places(response_t);
                 
			  }
			}
		);
        alert ("cities"+cities.length);*/
		
		FB.api(
			"/me/feed",
			function (response) {
			  if (response && !response.error) {
				  renderFBPosts(response);
			  }
			}
		);
        
	});

	////////////////////////////////////////////////////////////////////////////////////////
    //visualization link click handlers
    $("button#donut2").click(function(){
        //emotype_cat = filterdata_obj(emotype_cat);
            //draw_donut(emotype_cat,col_codes);
            count_data =  filterdata_obj_count(emotion_cat);
            draw_donut(count_data,null);
        });
        $("button#donut1").click(function(){
        //emotype_cat = filterdata_obj(emotype_cat);
            draw_donut(emotype_cat,col_codes);
            
        });
        $("button#bubble").click(function(){
           var likes_data = [];
           likes_data = filterdata_obj_likes(emotion_cat);
            //draw_donut(count_data,null);
           draw_bubble(likes_data); 
            
	    });
         $("button#fdg").click(function(){
              nodes = compute_nodes();
             links = compute_links();
              draw_weightedgraph(nodes,links);
             });
           $("button#emoji").click(function(){
              var emo = determin_emotion();
              draw_emoji(emo);
             });
	$("button#logout").click(function(){
		FB.logout(function(a){
			console.log(a);
			window.location.reload();                               
            
		});
	});
    //date-range slider function
     $(function() {
         var today = new Date();
    $( "#slider-range" ).slider({
      range: true,
      min: new Date('2010.01.01').getTime() / 1000,
      max:  today.getTime() / 1000,
      step: 86400,
      values: [ new Date('2013.01.01').getTime() / 1000, today.getTime() / 1000 ],
      slide: function( event, ui ) {
        $( "#amount" ).val( (new Date(ui.values[ 0 ] *1000).toDateString() ) + " - " + (new Date(ui.values[ 1 ] *1000)).toDateString() );
      }
    });
    $( "#amount" ).val( (new Date($( "#slider-range" ).slider( "values", 0 )*1000).toDateString()) +
      " - " + (new Date($( "#slider-range" ).slider( "values", 1 )*1000)).toDateString());
  });

});