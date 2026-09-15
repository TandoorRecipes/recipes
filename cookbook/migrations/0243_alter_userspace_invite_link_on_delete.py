import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    """
    Fix: change UserSpace.invite_link from on_delete=PROTECT to on_delete=SET_NULL.

    Before this migration, deleting an InviteLink that had been used to create a
    UserSpace raised a ProtectedError because the UserSpace row still held a
    foreign-key reference to the link.

    The invite_link field is audit data (it records which link brought a user into
    a space).  Deleting the link should not affect existing memberships; it should
    simply clear the audit reference (SET_NULL).  The field has always been
    nullable (null=True, blank=True), so SET_NULL is the correct semantic here.
    """

    dependencies = [
        ("cookbook", "0242_space_household_setup_completed"),
    ]

    operations = [
        migrations.AlterField(
            model_name="userspace",
            name="invite_link",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="cookbook.invitelink",
            ),
        ),
    ]
