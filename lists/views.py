
from django.http import HttpResponse, HttpResponseRedirect, QueryDict, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from .models import Profile, Gift, Family
import random, json
from django.contrib import messages
from django.db import IntegrityError
from django.core.exceptions import ObjectDoesNotExist
# Create your views here.
def index(request):
    return render(request, './index.html')

## signup page logic
def signup(request):
    ## signup to start a family plan
    if 'start' in request.path:
        ## load a signup for a family page
        if request.method == 'GET':
            return render(request, './signup/start_family.html')
        ## process logic for creating a family and the head of teh family user
        elif request.method == 'POST':
            try:
                # creating a family
                username = request.POST['username']
                password = request.POST['password']
                email = request.POST['email']
                first_name = request.POST['first_name']
                last_name = request.POST['last_name']
                family_name = request.POST['family_name']
                family_code=request.POST['family_code']
                number_of_gifts = request.POST['number_of_gifts']
                # creating a user
                user=''
                user = User.objects.create_user(username,email,password)
                family = Family.objects.create(number_of_gifts=number_of_gifts,last_name=family_name,family_code=family_code, family_head = user)
                # 
                user.profile.family_head = 1
                user.profile.last_name = last_name
                user.profile.email = email
                user.profile.first_name = first_name
                auth_user = authenticate(request, username=username, password=password)
                if user is not None:
                    login(request,auth_user)
                family.members.set((user.id,))
                family.save()
                user.profile.family = family
                user.save()
                return render(request, './index.html')
            except IntegrityError as e:
                if 'username' in e.args[0]:
                    messages.error(request, 'This username has already been occupied, try another one.')
                return HttpResponse(request, status=400)
    ## signup to join an existing family
    elif 'join' in request.path:
        ##open join a family page
        if request.method == 'GET':
            return render(request, './signup/join_family.html')
        #create a user to joing a family
        elif request.method == 'POST':
            try:
                print('trying to join')
                username = request.POST['username']
                password = request.POST['password']
                email = request.POST['email']
                first_name = request.POST['first_name']
                last_name = request.POST['last_name']
                family_code=request.POST['family_code']
                family = Family.objects.get(family_code=family_code)
                user = User.objects.create_user(username,email,password)
                user.profile.last_name = last_name
                user.profile.email = email
                user.profile.first_name = first_name
                auth_user = authenticate(request, username=username, password=password)
                if user is not None:
                    login(request,auth_user)
                family.members.add(user.id)
                family.save()
                user.profile.family = family
                user.save()
                return render(request, './index.html')
            except IntegrityError as e:
                if 'username' in e.args[0]:
                    messages.error(request, 'This username has already been occupied, try another one.')
                return HttpResponse(request, status=400)
            except ObjectDoesNotExist as e:
                messages.error(request, 'Incorrect family code, try again')
                return HttpResponse(request, status=400)
def login_page(request):
    if request.method == "GET":
        return render(request, './login.html')
    elif request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        try:
            auth_user = authenticate(request, username=username, password=password)
            # print(auth_user)
            if auth_user != None:
                login(request, auth_user)
                return render(request,'./index.html')
            else:
                messages.error(request, 'Incorrect Login or Password')
                return render(request,'./login.html')
        except:
            messages.error(request, 'Some error occured')
            return render(request,'./login.html')
def logout_func(request):
    logout(request)
    return render(request,'./index.html')
def profile(request, user=None):
    if request.user.is_authenticated:
        return render(request, './profile.html')
    else:
        return render(request, './login.html')
## gifts logic
def add_gifts(request, user=None):
    if request.method == 'GET':
        print('fetching gift info')
        family_id = request.GET['family_id']
        user_id = request.GET['user_id']
        family = Family.objects.get(pk=family_id)
        user = User.objects.get(pk=user_id)
        data = {
            'number_of_gifts':family.number_of_gifts
        }
        response = JsonResponse(data)
        return HttpResponse(response,status=200)
    elif request.method =='POST':
        data = QueryDict(request.body)
        gifts_pairs = data['gifts'].split(',')
        gifts = []
        for pair in gifts_pairs:
            gifts.append(pair.split('+'))
        user_id=request.POST['user_id']
        family_id = request.POST['family_id']
        family = Family.objects.get(pk=family_id)
        user = User.objects.get(pk=user_id)
        for gift in gifts:
            gift = Gift.objects.create(gift_name=gift[1])
            gift.receiver = user
            gift.save()
            user.profile.gifts.add(gift)
            family.family_gifts.add(gift)
        #     print(gift)
        # print(user.profile.gifts.all())
        # print(family.family_gifts)
        # print(gifts)
        return HttpResponse(status=200)
def random_gifts(request, user=None):
    data = QueryDict(request.body)
    family_id = data['family_id']
    family = Family.objects.get(pk=family_id)
    family_members = family.members.all()
    number_of_gifts = family.number_of_gifts
    max_gifts = family.max_gifts()
    if max_gifts<=0:
        max_gifts = 1
    family_check = {}
    # populating family_check
    for member in family_members:
        family_check[member]= {"assigned_gifts":[]}
        family_check[member]["assigned_gifts_count"]=0
        family_check[member]["gifts_left"]=number_of_gifts
        for other_member in family_members:
            if other_member != member:
                family_check[member][other_member]=0
    # assigning gifts
    for member in family_members:
        the_rest = []
        for person in family_members:
            if member != person and family_check[person]['assigned_gifts_count']<number_of_gifts :
                the_rest.append(person)
        for gift in member.profile.gifts.all():
            checker = True
            while checker:
                giver = random.choice(the_rest)
                if giver != member:
                    if family.even() and family_check[giver]['assigned_gifts_count']<number_of_gifts and  family_check[member][giver]!=max_gifts:
                        family_check[member]["gifts_left"]-=1
                        family_check[giver]['assigned_gifts'].append(member)
                        family_check[member][giver]+=1
                        family_check[giver]["assigned_gifts_count"]+=1
                        checker = False
                        gift.giver = giver
                        gift.save()
                        giver.profile.assigned_gifts.add(gift)
                    elif family_check[member]["gifts_left"] == 1 and family_check[giver]['assigned_gifts_count']<number_of_gifts and family_check[member][giver]!=max_gifts:
                        family_check[member]["gifts_left"]-=1
                        family_check[giver]['assigned_gifts'].append(member)
                        family_check[member][giver]+=1
                        family_check[giver]["assigned_gifts_count"]+=1
                        checker = False
                        gift.giver = giver
                        gift.save()
                        giver.profile.assigned_gifts.add(gift)
                    elif family_check[member][giver]!=max_gifts and  family_check[giver]['assigned_gifts_count']<number_of_gifts and family_check[giver][member]!=max_gifts:
                        family_check[member]["gifts_left"]-=1
                        family_check[giver]['assigned_gifts'].append(member)
                        family_check[member][giver]+=1
                        family_check[giver]["assigned_gifts_count"]+=1
                        checker = False
                        gift.giver = giver
                        gift.save()
                        giver.profile.assigned_gifts.add(gift)
    family.gifts_assigned = True
    family.save()
    return HttpResponse(status=200)
def reveal_names(request, user=None):
    data = QueryDict(request.body)
    family_id = data['family_id']
    family = Family.objects.get(pk=family_id)
    try:
        family.reveal_names = True
        family.save()
        return HttpResponse(status=200)
    except:
        return HttpResponse(status=404)
def hide_names(request, user=None):
    data = QueryDict(request.body)
    family_id = data['family_id']
    print(family_id)
    family = Family.objects.get(pk=family_id)
    try:
        family.reveal_names = False
        family.save()
        return HttpResponse(status=200)
    except:
        return HttpResponse(status=404)
def assign_gifts(request, user=None):
    if request.method == 'GET':
        data = request.GET
        family_id = data['family_id']
        # print(dir(request.GET))
        # print(data)
        family = Family.objects.get(pk=family_id)
        gifts = family.get_family_gifts()
        member_ids = []
        available_gifts = family.get_aval_gifts()
        print(available_gifts)
        family_members = {}
        for member in family.members.all():
            family_members[member.id]={}
            family_members[member.id]['assigned_gifts']=member.profile.get_assigned_gifts()
            family_members[member.id]['own_gifts']=member.profile.get_own_gifts()
            family_members[member.id]['name']=member.profile.name()
            family_members[member.id]['id']=member.id
            member_ids.append(member.id)
        data = {
            'family_members':family_members,
            'available_gifts':available_gifts,
            'number_of_gifts':family.number_of_gifts,
            'member_ids':member_ids,
            'gifts':gifts,
        }
        response = JsonResponse(data)
        return HttpResponse(response, status=200)
        # availible_gifts = 
    elif request.method == 'POST':
        # data = QueryDict(request.body)
        data = json.loads(request.POST['data'])
        family_id = request.POST['family_id']
        family = Family.objects.get(pk=family_id)
        # print(data)
        for member in family.members.all():
            # check if the person was assigned max amount of gifts
                for gift_info in data['family_members'][f'{member.id}']['assigned_gifts']:
                    gift = Gift.objects.get(pk=gift_info[0])
                    gift.giver = member
                    gift.save()
                    if gift not in member.profile.assigned_gifts.all():
                        member.profile.assigned_gifts.add(gift)
                        member.save()

        # unassigning all available gifts
        for gift in data['available_gifts']:
            gift = Gift.objects.get(pk=gift[0])
            try:
                giver = gift.giver
                giver.profile.assigned_gifts.remove(gift)
                gift.giver = None
                giver.save()
            except:
                pass
            gift.save()
        if data['available_gifts']:
            family.gifts_assigned=False
        else:
            family.gifts_assigned=True
        family.save()
    elif request.method == "DELETE":
        data = QueryDict(request.body)
        print(data)
        family_id = data['family_id']
        family = Family.objects.get(pk=family_id)
        for member in family.members.all():
            for gift in member.profile.assigned_gifts.all():
                gift_id = gift.id
                gift.giver=None
                gift.save()
                member.profile.assigned_gifts.remove(gift_id)
        family.gifts_assigned=False
        family.save()
    return HttpResponse(status=200)