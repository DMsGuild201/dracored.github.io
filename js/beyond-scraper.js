var final_spells = {
    spell: []
}

var global_count = 0;
var header_completed = false;

$(function(){

    $("#Scrape-Button").click(function(){
        var site = document.getElementById("beyond-link").value;

        //var site = "https://www.dndbeyond.com/spells/76594-conjure-castle";

        // Get 
        $.getJSON('https://api.allorigins.ml/get?url=' + encodeURIComponent(site) + '&callback=?', function(data){
            var $html = $($.parseHTML(data.contents));

            //Spell Name
            var spell_name = $html.find(".page-title").html().trim();

            //Spell Level
            var level_text = $html.find(".ddb-statblock-item-value").html().trim();
            var spell_level = parseInt(level_text.slice(0,1),10);

            // Spell School
            var school = $html.find("div.ddb-statblock-item.ddb-statblock-item-school > div.ddb-statblock-item-value").html().trim();
            switch(school){
                case "Abjuration":
                    var spell_school = "A";
                    break;
                case "Conjuration":
                    var spell_school = "C";
                    break;
                case "Divination":
                    var spell_school = "D";
                    break;
                case "Enchantment":
                    var spell_school = "E";
                    break;
                case "Evocation":
                    var spell_school = "V";
                    break;
                case "Illusion":
                    var spell_school = "I";
                    break;
                case "Necromancy":
                    var spell_school = "N";
                    break;
                case "Transmutation":
                    var spell_school = "T";
                    break;
            }

            //Time
            var time = $html.find("div.ddb-statblock-item.ddb-statblock-item-casting-time > div.ddb-statblock-item-value").html().trim();
            var split_time = time.split(" ");

            var spell_cast_time = {number: parseInt(split_time[0], 10), unit: split_time[1]};

            //Range
            var range = $html.find("div.ddb-statblock-item.ddb-statblock-item-range-area > div.ddb-statblock-item-value").html().trim();
            var split_range = range.split(" ");

            if(split_range[0] == "Self"){
                var spell_range = {type: "point", distance: {type: "self"}};
            }
            else{
                var spell_range = {type: "point", distance: {type: split_range[1], amount: parseInt(split_range[0], 10)}};
            }

            //Components
            var spell_components = {};

            var comp = $html.find("div.ddb-statblock-item.ddb-statblock-item-components > div.ddb-statblock-item-value > span").html().trim();
            var comp_split = comp.split(",");
            try{
                var mat = $html.find(".components-blurb").html().trim().slice(5, -1);
                var slicer = $html.find(".components-blurb").html().length;
            }catch{
                console.log("No MATERIALS found");
            }
            

            if(comp.includes("V")){
                Object.assign(spell_components, {v: true});
            }
            if(comp.includes("S")){
                Object.assign(spell_components, {s: true});
            }
            if(comp.includes("M")){
                Object.assign(spell_components, {m: mat});
            }

            //Duration
            var duration = {};
            var durt = $html.find("div.ddb-statblock-item.ddb-statblock-item-duration > div.ddb-statblock-item-value").html().trim().split(" ");
                      

            if(durt.includes("Instantaneous")){
                if(durt.includes("Concentration")){
                    Object.assign(duration, {concentration: true});
                }
                Object.assign(duration, {type: "instant"});
                var spell_duration = [duration];
            }
            else{
                if(durt.includes("Concentration")){
                    Object.assign(duration, {concentration: true});
                }
                Object.assign(duration, {type: "timed"});
                var duration2 = {type: durt[durt.length-1], amount: parseInt(durt[durt.length-2], 10)};
                Object.assign(duration, duration2);
                var spell_duration = [{type: "timed", duration}];
            }

            //Classes
            var classes = [];
            var classes2 = $html.find("footer").html();

            if(classes2.includes(">Wizard<")){
                classes.push({name: "Wizard", source: "PHB"});
            }
            if(classes2.includes(">Sorcerer<")){
                classes.push({name: "Sorcerer", source: "PHB"});
            }
            if(classes2.includes(">Bard<")){
                classes.push({name: "Bard", source: "PHB"});
            }
            if(classes2.includes(">Warlock<")){
                classes.push({name: "Warlock", source: "PHB"});
            }
            if(classes2.includes(">Druid<")){
                classes.push({name: "Druid", source: "PHB"});
            }
            if(classes2.includes(">Cleric<")){
                classes.push({name: "Cleric", source: "PHB"});
            }
            if(classes2.includes(">Ranger<")){
                classes.push({name: "Ranger", source: "PHB"});
            }
            if(classes2.includes(">Paladin<")){
                classes.push({name: "Paladin", source: "PHB"});
            }

            var spell_classes = {fromClassList: classes};

            var spell_desc = [];
            $.each($html.find(".more-info-content > p"), function(){
                var temp_d = document.createElement("div");
                temp_d.innerHTML = this.innerHTML;
                spell_desc.push(temp_d.innerText);
            });

            //var desc_div = document.createElement("div");
            //desc_div.innerHTML = desc;

            var spell = {
                name: spell_name,
                source: "HB",
                level: spell_level,
                school: spell_school,
                time: [spell_cast_time],
                range: spell_range,
                components: spell_components,
                duration: spell_duration,
                classes: spell_classes,
                entries: spell_desc,
                id: spell_name + global_count.toString()
            };

            // Header setup

            //var author = $html.find(".source source-description").html();

            if(header_completed == false){

                header_completed = true;
                

                var header = {
                    sources:[{
                        json: "Beyond Converter",
                        abbreviation: "BHB",
                        authors: ["YOUR NAME HERE"],
                        version: "1.0.0",
                        url: site,
                        targetSchema: "1.2.3"
                    }],
                    dateAdded: 0
                };

                Object.assign(final_spells, {_meta: header});
            }else{
                //final_spells._meta.authors.push(author);
            }

            final_spells.spell.push(spell);

            alert("Successfully Imported " + spell_name + "!");

            $("#data-table").append("<tr class=\"table-line\" id=\"" + spell_name + global_count.toString() + "\" ><th class=\"table-entry\">" + spell_name + "</th></tr>");
            global_count = global_count + 1;
            document.getElementById("beyond-link").value = "";

        });
    });

    $("#json-copy").click(function(){
        const el = document.createElement('textarea');
        el.value = JSON.stringify(final_spells);
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert("Copied JSON to clipboard!");
    });

    $("#json-save").click(function(){
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(final_spells));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", "5eSpells" + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    $("#json-export").click(function(){
        $.ajax({
            url:"https://api.myjson.com/bins",
            type:"POST",
            data: JSON.stringify(final_spells),
            async: false,
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: function(data, textStatus, jqXHR){
                const el = document.createElement('textarea');
                el.value = data.uri;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                window.open(data.uri);
            }
        });
    });

    $("#json-clear").click(function(){
        final_spells.spell = [];
        document.getElementById("data-table").innerHTML = "<tr><th class=\"table-header\">Click Spell to Remove</th></tr>";
    });

    $("table").on("click", ".table-line", function(){
        var id = $(this).attr('id');
        for(var i = 0; i < final_spells.spell.length; i++){
            if(final_spells.spell[i].id == id){
                var name = final_spells.spell[i].spell_name;
                alert("Successfully removed " + name);
                final_spells.spell.splice(i,1);
                $(this).remove();
            }
        }
    });

});


