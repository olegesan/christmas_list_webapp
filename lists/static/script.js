
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
        $('.message').text('complete all the fields')
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
            console.log('success starting')
            console.log(data)
            location.href = '/'
        })
        .fail(function(data){
            console.log('sorry, we let you down')
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
            console.log('success joining')
            location.href = '/'

        })
        .fail(function(data){
            console.log('sorry, we let you down')
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
// $('#some_button').click(function(){
//     values = [2,34,5,3, 'soemthing else', 'some gifts']
//     for(i=0; i<10; i++){
//         values.push(i)
//     }
//     console.log(values)
//     // jsonText = JSON.stringify(values)
//     $.ajax({
//         url:'some_button',
//         method: "POST",
//         data:{
//             'values':values
//         }
//     })
//     .done(function(data){
//         console.log(data)
//     })
// })