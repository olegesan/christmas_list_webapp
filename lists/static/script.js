
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
// $.ajaxSetup({
//     data: {csrfmiddlewaretoken: '{{ csrf_token }}' },
//   });
var csrftoken = getCookie('csrftoken');
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
})



$('input[name="family_name"]').change(function(){
    $('input[name="family_code"]').val($(this).val()+Math.round((Math.random()*1000000)))
})
function req_field(){
    output= true
    $('form input:required').each(function(){
        if(!$(this).val()){
            output =  false
        }
    })
    return output
}
$('.submit').click(function(){
    if(!req_field()){
        message =  `<div class="alert alert-danger alert-dismissible fade show" role="alert">Complete all the fields<button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button></div>`
        $('.messages').html(message)
        return
    }
    
    first_name = $('input[name="first_name"]').val()
    last_name = $('input[name="last_name"]').val()
    username = $('input[name="username"]').val()
    password = $('input[name="password"]').val()
    email = $('input[name="email"]').val()
    family_code = $('input[name="family_code"]').val()
    if ($(this).val()=='Start'){
        console.log('start')
        family_name = $('input[name="family_name"]').val()
        number_of_gifts = $('input[name="number_of_gifts"]').val()
        console.log(family_code)
        $.ajax({
            url:'/signup/start_family',
            method:'POST',
            data:{
                'first_name':first_name,
                'last_name':last_name,
                'username':username,
                'password':password,
                'email':email,
                'family_name':family_name,
                'family_code':family_code,
                'number_of_gifts':number_of_gifts
            }
        })
        .done(function(data){
            location.href = '/'
        })
        .fail(function(data){
            location.reload(true)
        })
    }
    else{
        console.log('not start')
        $.ajax({
            url:'/signup/join_family',
            method:'POST',
            data:{
                'first_name':first_name,
                'last_name':last_name,
                'username':username,
                'password':password,
                'email':email,
                'family_code':family_code,
            }
        })
        .done(function(data){
            location.href = '/'

        })
        .fail(function(data){
            location.reload(true)
        })
    }
    
 })
 data={}
 modal = $('.modal') 
 $("#add_gifts").click(function(){
    console.log(family_id)
    $.ajax({
        url:'/add_gifts',
        method:'GET',
        data:{
            'family_id':family_id,
            'user_id':user_id
        }
    })
    .done(function(data_ajax){
        data = JSON.parse(data_ajax)
        data['gifts_left']=data['number_of_gifts']
        $('.modal').toggle()
        form_for_gifts = ''

        for(i=0;i< data['number_of_gifts'];i++){
            form_for_gifts+=`<div> ${i+1}. <input id='${i+1}' class='form-control d-inline gift' type='text' name='gift_${i}' required></div>`
        }
        $('.modal-content').html(`<div>Gift List</div>
        <div class='gift_list_message'></div>
        <div>${form_for_gifts}</div>
        <div class='pt-4 d-flex justify-content-between'>
        <div class='col-5 submit btn btn-success'>submit</div>
        <div class='col-5 cancel btn btn-danger'>cancel</div>
        </div>
        `)
    })
    .fail(function(data){
        console.log(data)
        console.log('fail')
    })
 })

 $('.modal').on('change', '.gift', function(){
    if($(this).val()==''){
        data['gifts_left']+=1
    }else{
        data['gifts_left']-=1
    }
 })
 $('.modal').on('click', '.submit', function(){
    if(data['gifts_left']>0){
        $('.modal').find('.gift_list_message').text('Add more gifts')
    }
    else{
        gifts = ''
        $('.gift').each(function(){
            gifts+=`${$(this).attr('id')}+${$(this).val()},`
        })
        console.log(gifts)
        $.ajax({
            url:'/add_gifts',
            method:'POST',
            data:{
                'family_id':family_id,
                'user_id':user_id,
                'gifts':gifts.substring(0,gifts.length-1),
            }
        })
        .done(function(data){
            location.reload(true)
            
        })
    }
 })
 $('.modal').on('click','.cancel', function(){
    $('.modal-content').html('') 
    modal.hide()
})

// When the user clicks anywhere outside of the modal, close it
// manage random gifts assingment ajax request
$('#random_gifts').click(function(){
    console.log('random')
    $.ajax({
        url:'random_gifts',
        method:'POST',
        data:{
            'family_id':family_id,
            'user_id':user_id,
        }
    })
    .done(function(data){
        location.reload(true)
    })
})
$('#reveal_names').click(function(){
    $.ajax({
        url:'reveal_names',
        method:'POST',
        data:{
            'family_id':family_id,
            'user_id':user_id,
        }
    })
    .done(function(data){
        location.reload(true)
    })
})
$('#hide_names').click(function(){
    $.ajax({
        url:'hide_names',
        method:'POST',
        data:{
            'family_id':family_id,
            'user_id':user_id,
        }
    })
    .done(function(data){
        location.reload(true)
    })
})
//updating available gifts div
function upd_aval_gifts_div(user_id){
    console.log('upd_aval_gifts')
    available_gifts = data['available_gifts']
    div_html=''
    for(i=0; i<available_gifts.length;i++){
        if(available_gifts[i][2]!=user_id){
            div_html+=`<div id='gift_${available_gifts[i][0]}'class='gift_bubble'>${available_gifts[i][1]}</div>`
        }
    }
    modal.find("#aval_gifts").html(div_html)
    return div_html
}

//adding options for select Gift slots
function add_options_select_gifts(gift_id, selected_slot){
    if(gift_id!='None'){
        console.log(selected_slot)
        gift_name = data['gifts'][gift_id][1]
        option = `<option value=${gift_id}>${gift_name}</option>`
        modal.find(`.gift_slot`).each(function(){
            if(!$(this).is(selected_slot)){
                $(this).append(option)
            }
        })
    }
}
// removing options when chosen from available gifts
function del_options_selected_gifts(gift_id){
    if(gift_id!='None'){
        modal.find(`option[value=${gift_id}]`).each(function(){
            if(!$(this).prop('selected')){
                $(this).remove()
            }
            
        })
    }
}
//populating selected/availible gifts for the person
function get_gift_slots(user_id){
    own_gifts = data['family_members'][user_id]['own_gifts']
    assigned_gifts = data['family_members'][user_id]['assigned_gifts']
    available_gifts = data['available_gifts'].filter(arr=> arr[2]!=user_id)
    gifts= data['gifts']
    selected_attr_gifts=[]
    select_element = ''
    gift_slots=function(){
        for(b=0; b<data['number_of_gifts'];b++){
            select_element+=`<select class='gift_slot'>`
            // checking if gifts have been already assigned
            // if assigned, then just show assigned select option + Not Assigned slot, to disassign the gift

            //some gifts have been assigned, some are still available (probably user re-assigning them)
            if(assigned_gifts.length>0 & available_gifts.length>0){
                if(b<assigned_gifts.length){
                    console.log(`Selected gift: ${assigned_gifts}`)
                    select_element+=`<option value ='None'>(Not Assigned)</option>`
                    select_element+=`<option value =${assigned_gifts[b][0]} selected>${assigned_gifts[b][1]}</option>` 
                    selected_attr_gifts.push(assigned_gifts[b][0])
                }
                else{
                    select_element+=`<option value ='None' selected>(Not Assigned)</option>`
                }
                for(i=0; i<available_gifts.length;i++){
                    if(available_gifts[i][2]!=user_id){
                        console.log('first condition, for loop with available gifts')
                        select_element+=`<option value =${available_gifts[i][0]}>${available_gifts[i][1]}</option>`
                }
            }

            }
            else if(assigned_gifts.length==data['number_of_gifts']){
                console.log('no aval gifts')
                select_element+=`<option value ='None'>(Not Assigned)</option>`
                select_element+=`<option value =${assigned_gifts[b][0]} selected>${assigned_gifts[b][1]}</option>`
            }
            // if gifts unassigned, then look through all availible gifts and give them all as options, except person's own gifts
            else{
                console.log('else')
                selected_element=false
                for(i=0; i<available_gifts.length;i++){
                    if(available_gifts[i][2]!=user_id){
                        if(available_gifts[i][3]==user_id & !selected_element & !selected_attr_gifts.includes(available_gifts[i][0])){
                            select_element+=`<option value =${available_gifts[i][0]} selected>${available_gifts[i][1]}</option>`
                            selected_element=true
                            selected_attr_gifts.push(available_gifts[i][0])
                        }
                        else{
                            select_element+=`<option value =${available_gifts[i][0]}>${available_gifts[i][1]}</option>`
                        }
                        
                    }
                }
                if(selected_attr_gifts.length==0){
                    select_element+=`<option value ='None' selected>(Not Assigned)</option>`
                }
            }
            select_element+="</select>"
        }
    }
    gift_slots()
    return select_element
}
// 

//pullin up menu to assign gifts 
$('#assign_gifts').click(function(){
    console.log(family_id)
    console.log(user_id)
    $.ajax({
        url:'assign_gifts',
        method:'GET',
        data:{
            'family_id':family_id,
            'user_id':user_id,
        }
    })
    .done(function(data1){
        data=JSON.parse(data1)
        console.log(data)
        // getting the gifts HTML
        available_gifts = ''
        available_gifts_choice = ''
        for(i=0; i<data['available_gifts'].length;i++){
            available_gifts_choice+=`<option value =${data['available_gifts'][i][0]}>${data['available_gifts'][i][1]}</option>`
            available_gifts+=`<div id='gift_${data['available_gifts'][i][0]}'class='gift_bubble'>${data['available_gifts'][i][1]}</div>`
        }
        // 

        // getting the members HTML
        members = ''
        for(i=0;i<data['member_ids'].length;i++){
            member_id = data['member_ids'][i]
            name = data['family_members'][member_id]['name']
            members+= `<option value=${member_id}>${name}</option>`
        }
        // 

        // getting gift slots
        gift_slots=''
        for(i = 1; i<=data['number_of_gifts'];i++){
            gift_slots+= ` <select class='gift_slot'>
                ${available_gifts_choice}
            </select>`
        }
        modal.toggle()
        $('.modal-content').html(`
        <h2> Available Gifts:</h2>
        <div class='d-flex flex-col flex-wrap mb-2' id='aval_gifts'>
        ${upd_aval_gifts_div(data['member_ids'][0])}
        </div>
        <div class='container row'>
        <label class='h4'>Member:</label>
        <select id='member_to_assign'class='pr-4 ml-2'>
        ${members}
        </select>
        </div>
        <div class='gift_pick_container d-flex flex-column'>
        ${get_gift_slots(data['member_ids'][0])}
        </div>
        <div class='d-flex justify-content-between mt-3'>
        <span class='col-5 cancel btn btn-danger'>cancel</span>
        <span class='col-5 save btn btn-success'>save</span>
        </div>
        `)
    })
})

// logic to change gift slots for person in gift assign menu
modal.on( 'change','#member_to_assign', function(){
    user_selected_id = $(this).children("option:selected").val()
    gifts = get_gift_slots(user_selected_id)
    modal.find('.gift_pick_container').html(gifts)
    upd_aval_gifts_div(user_selected_id)
})

modal.on( 'click','.gift_slot', function(){
    temp_gift_id = $(this).val()
    data['temp_gift_id']=$(this).val()
    data['temp_gift_name']=$(this).children('option:selected').text()
    if(!temp_gift_id=='None'){
        data['temp_gift_reciever'] = data['gifts'][temp_gift_id][2]
    }
    })
modal.on( 'change','.gift_slot', function(){
    gift_name = $(this).children('option:selected').text()
    selected_gift_id = $(this).children('option:selected').val()
    user_selected_id = modal.find('#member_to_assign').children("option:selected").val()
    // console.log(user_selected_id)
    
    //dynamically change available gifts div - adding new divs
    aval_gift_div = ''
    if(data['temp_gift_id']!='None'){
        temp_gift_id = data['temp_gift_id']
        temp_gift_info = data['gifts'][temp_gift_id]
        data['family_members'][user_selected_id]['assigned_gifts']= data['family_members'][user_selected_id]['assigned_gifts'].filter(arr => JSON.stringify(arr)!=JSON.stringify(temp_gift_info))
        if(temp_gift_info.length ==4){
            temp_gift_info.pop()
            // console.log(data['gifts'][temp_gift_id])
        }
        // not adding it if the gift is already there
        if(!data['available_gifts'].includes(temp_gift_info)){
            console.log('not adding stuff to div')
            aval_gift_div+=`<div id='gift_${data['temp_gift_id']}'class='gift_bubble'>${data['temp_gift_name']}</div>`
            modal.find('#aval_gifts').append(aval_gift_div)
            data['available_gifts'].push(temp_gift_info)
        }
        
        // data['family_members'][user_selected_id]['assigned_gifts'].push(temp_gift_info)
    }
    //

    //dynamically change available gifts div - deleting
    selected_gift_info=null
    if(selected_gift_id!='None'){
        selected_gift_info = data['gifts'][selected_gift_id]
        if(JSON.stringify(data['available_gifts']).includes(JSON.stringify(selected_gift_info))){
            data['available_gifts'] = data['available_gifts'].filter( arr => JSON.stringify(arr)!=JSON.stringify(selected_gift_info))
            data['family_members'][user_selected_id]['assigned_gifts'].push(selected_gift_info)
            data['gifts'][selected_gift_id].push(user_selected_id)
            modal.find(`#gift_${selected_gift_id}`).remove()
        }
    }
    //
    gift_slot_obj = $(this)
    // data['gifts'] = data['gifts'].filter(arr => arr[0]!=selected_gift_id)
    console.log(data['family_members'][user_selected_id]['assigned_gifts'])
    // data['family_members'][user_selected_id]['assigned_gifts'].push([selected_gift_id, gift_name])
    upd_aval_gifts_div(user_selected_id)
    del_options_selected_gifts(selected_gift_id)
    add_options_select_gifts(temp_gift_id, gift_slot_obj)
    // gifts = get_gift_slots(user_selected_id)
    // modal.find('.gift_pick_container').html(gifts)
})

// clear assingment of all family_gifts
$('#clear_gifts').click(function(){
    $.ajax({
        url:'assign_gifts',
        method: "DELETE",
        data:{
            'family_id':family_id,
            'user_id':user_id,
        }
    })
    .done(function(data){
        location.reload(true)
    })
})
modal.on('click','.save', function(){
    $.ajax({
        url:'assign_gifts',
        method:'POST',
        data:{
            'family_id':family_id,
            'user_id':user_id,
            'data':JSON.stringify(data)
        }
    })
    .done(function(){
        location.reload(true)
    })
})
