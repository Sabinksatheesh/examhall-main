import openpyxl
from openpyxl import Workbook
import sys
import json

# ACCEPT JSON DATA FROM COMMAND-LINE ARGUMENTS
data_json = sys.argv[1]
data = json.loads(data_json)

for sem in data:
    # LOAD MAIN EXCEL SHEET
    wb = openpyxl.load_workbook('./uploadedExcels/' + sem)
    sheetname = wb.sheetnames
    ws = wb[sheetname[0]]

    # IDENTIFYING BRANCHES
    branches = set(a.value for a in ws['D'])
    branch_list = list(branches)
    while None in branch_list:
        branch_list.remove(None)
    if 'Branch Name' in branch_list:
        branch_list.remove('Branch Name')
    print(branch_list)

    code_list = []
    sub_list = []

    for sub in branch_list:
        wb_branch = Workbook()
        ws_branchMain = wb_branch.active
        ws_branchMain.title = 'Main'
        r = 1

        print('\n', sub)
        for p in range(1, ws.max_row + 1):
            if ws.cell(row=p, column=4).value == sub:
                nm = ws.cell(row=p, column=1).value
                regno = nm[-11:-1:1]
                email = ws.cell(row=p, column=9).value  # EMAIL from column I
                ws_branchMain.cell(row=r, column=1).value = nm
                ws_branchMain.cell(row=r, column=2).value = regno
                ws_branchMain.cell(row=r, column=3).value = sub
                ws_branchMain.cell(row=r, column=4).value = ws.cell(row=p, column=7).value  # slot
                ws_branchMain.cell(row=r, column=5).value = ws.cell(row=p, column=8).value[-9:-3:1]  # subcode
                ws_branchMain.cell(row=r, column=6).value = email
                r += 1

        codeno = regno[5:7]
        code_list.append(codeno)
        xl = './updatedExcels/' + sem[0:2] + '_' + codeno + '.xlsx'
        wb_branch.save(xl)

        # SORTING
        wb_branch.create_sheet('Temp')
        wb_branchMain = wb_branch['Temp']
        data_set = set(ws_branchMain.iter_rows(min_row=1, values_only=True))
        sorted_data = sorted(list(data_set), key=lambda x: x[1])
        for row in sorted_data:
            wb_branchMain.append(row)

        # IDENTIFY SLOTS
        slot_set = set(a.value for a in wb_branchMain['D'])
        slot_list = sorted([x for x in slot_set if x])
        print(slot_list)

        thisdict = {}

        for slot in slot_list:
            wb_branch.create_sheet(slot)
            wb_branchRegular = wb_branch[slot]
            year_set = set()

            for p in range(1, wb_branchMain.max_row + 1):
                if wb_branchMain.cell(row=p, column=4).value == slot:
                    year_set.add(wb_branchMain.cell(row=p, column=2).value[3:5])

            year_list = sorted(list(year_set))
            if len(year_list) != 1:
                wb_branch.create_sheet(slot + '_supply')
                wb_branchSupply = wb_branch[slot + '_supply']
            else:
                wb_branchSupply = None

            r = 1
            check_supply = 1
            for p in range(1, wb_branchMain.max_row + 1):
                if wb_branchMain.cell(row=p, column=4).value == slot:
                    if wb_branchMain.cell(row=p, column=2).value[3:5] == year_list[-1]:
                        # REGULAR
                        for c in range(1, 7):
                            wb_branchRegular.cell(row=r, column=c).value = wb_branchMain.cell(row=p, column=c).value
                        r += 1
                    else:
                        # SUPPLY
                        for c in range(1, 7):
                            wb_branchSupply.cell(row=check_supply, column=c).value = wb_branchMain.cell(row=p, column=c).value
                        check_supply += 1

            print('Max row in Regular:', wb_branchRegular.max_row)
            thisdict[codeno + slot] = wb_branchRegular.max_row
            if wb_branchSupply and check_supply > 1:
                print('Max row in Supply:', wb_branchSupply.max_row)

        wb_branch.save(xl)
        sub_list.append(thisdict)
