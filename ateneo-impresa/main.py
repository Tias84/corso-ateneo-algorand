from pyteal import *

OWNER = Bytes("owner")


@Subroutine(TealType.uint64)
def deploy():
    sender = Txn.sender()

    return Seq(App.globalPut(OWNER, sender), Return(Int(1)))


@Subroutine(TealType.uint64)
def change_owner():
    sender = Txn.sender()
    owner = App.globalGet(OWNER)
    new_owner = Txn.accounts[1]

    return Seq(Assert(sender == owner), App.globalPut(OWNER, new_owner), Return(Int(1)))


def approval_program():
    program = Cond(
        [Txn.application_id() == Int(0), deploy()],
        [
            And(Global.group_size() == Int(1), Txn.rekey_to() == Global.zero_address()),
            change_owner(),
        ],
    )

    return compileTeal(program, Mode.Application, version=6)


def clear_program():
    program = Return(Int(1))

    return compileTeal(program, Mode.Application, version=6)


if __name__ == "__main__":
    approval = open("ateneo-impresa/contracts/approval.teal", "w")
    approval.write(approval_program())

    clear = open("ateneo-impresa/contracts/clear.teal", "w")
    clear.write(clear_program())
