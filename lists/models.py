from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import math
# Create your models here.

class Gift(models.Model):
    gift_name = models.CharField(max_length=128)
    receiver = models.ForeignKey(User, related_name = 'gift_receiver', blank = True, on_delete=models.CASCADE, null= True)
    giver = models.ForeignKey(User, related_name = 'gift_giver', blank = True, on_delete=models.CASCADE, null = True)
    def __str__(self):
        return f'{self.gift_name}, reciever:{self.receiver}, giver:{self.giver}'
class Family (models.Model):
    members = models.ManyToManyField(User, related_name='family_members', blank = False)
    number_of_gifts = models.IntegerField()
    family_code = models.CharField(max_length=64)
    last_name = models.CharField(max_length=64)
    lock = models.BooleanField(default = False)
    family_gifts = models.ManyToManyField(Gift, blank = True)
    family_head = models.ForeignKey(User, on_delete=models.CASCADE, blank=False)
    reveal_names = models.BooleanField(default=False)
    def __str__(self):
        return f' {self.id}: {self.last_name}, code: {self.family_code},head:{self.family_head}, gifts allowed: {self.number_of_gifts}, memebers:{self.members.all()}, gifts:{self.family_gifts.all()}'
    def gifts_submitted(self):
        return self.family_gifts.count()
    def gifts_max(self):
        return self.members.count()*self.number_of_gifts
    def gifts_per_member(self):
        return round(self.number_of_gifts/self.members.count())
    def max_gifts(self):
        # return math.floor((self.family_gifts.count()-self.number_of_gifts)**((self.members.count())**-1))
        return round(self.number_of_gifts/(self.members.count()-1))
    def even(self):
        if (self.members.count()*self.family_gifts.count())%2==0:
            return True
        else:
            return False
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete = models.CASCADE)
    family = models.ForeignKey(Family, on_delete=models.SET_NULL, blank= True, null=True)
    first_name = models.CharField(max_length=64, blank=True)
    last_name = models.CharField(max_length=64, blank=True)
    email = models.EmailField(blank=True)
    gifts = models.ManyToManyField(Gift, blank = True)
    assigned_gifts = models.ManyToManyField(Gift, related_name = 'assigned_gifts', blank=True)
    # gifts=models.
    family_head=models.BooleanField(default=False)
    def name(self):
        if (self.first_name and self.first_name != '') and (self.last_name and self.last_name!=''):
            return f'{self.first_name} {self.last_name}' 
        else:
            return f'{self.user}'
    def __str__(self):
        return f'{self.user}, family: {self.family}'
    def get_assigned_gifts(self):
        output = []
        for gift in self.assigned_gifts.all():
            output.append([gift.id, gift.gift_name])
        return output
    def get_own_gifts(self):
        output = []
        for gift in self.gifts.all():
            output.append([gift.id, gift.gift_name])
        return output
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()