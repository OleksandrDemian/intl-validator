# intl-validator

## App description
I need a script that validates if all languages are properly translated. The script should read all the .tsx files in the repository and check if the translations in that file are present.

## Stack
- ts-morph for analyzing scripts
- fs-extra to read files
- fast-glob to scan project

## How it should work

### 1. Read config file
In the root folder there will be `.intl-validator.json` file. It will include 2 properties:
- project root (path)
- example transaltion json (path)

### 2. Scan all .tsx files in project root
Read all files using project root path from config file (previous step). Then look for all the files

### 3. Check if file imports `next-intl`
If the file has no `next-intl` skip it and move to the next one

### 3. Check namespaces
From next intl the user will import `useTranslations` hook like this:

```ts
import { useTranslations } from 'next-intl';
```

Keep in mind the import can be aliased, like this:

```ts
import { useTranslations as transalte } from 'next-intl';
```

Then, in the code check when the user creates namespace (can be multiple namespaces):

```ts
const t = useTranslations('components.fileUploadZone');
```

After that, check in the code where the `t` (or whatever name was used, mind multiple namespaces) is used and extract the transaltion name.

Here is an example:

```ts
import { useTranslations } from 'next-intl';

export const CompanyStatusBadge = ({
  status,
  sx,
}: {
  status: CompanyTypes.OnboardingStatuses | undefined;
  sx?: SxProps;
}) => {
  const t = useTranslations('status');
  const tGeneral = useTranslations('buttons');

  return (
    <Box sx={sx}>
      {(status === CompanyTypes.OnboardingStatuses.KYC_PENDING_APPROVAL ||
        status === CompanyTypes.OnboardingStatuses.CONTRACT_SENT ||
        status === CompanyTypes.OnboardingStatuses.CONTRACT_SIGNED) && (
        <Typography>
          {t('in_review')}
        </Typography>
      )}
      {status === CompanyTypes.OnboardingStatuses.ONBOARDED && (
        <Typography>
          {t('onboarded')}
        </Typography>
      )}

      {(status === CompanyTypes.OnboardingStatuses.TERMINATED ||
        status === CompanyTypes.OnboardingStatuses.DECLINED) && (
        <Typography>
          {t('declined')}
        </Typography>
      )}

      {(CompanyTypes.OnboardingStatuses.KYC_SENT == status ||
        CompanyTypes.OnboardingStatuses.REGISTERED == status) && (
        <Typography>
          {t('in_progress')}
        </Typography>
      )}

      <Button>{tGeneral('submit')}</Button>
    </Box>
  );
};
```

In the example above, the script should extract the following names:
- status.in_review
- status.onboarded
- status.declined
- status.in_progress
- buttons.submit

### 4. Compare with translation file if all names are present

After all filese were scanned and all names read, check if they are all contained in translation file (read using path from config in step 1).

Here is example of transaltion file:

```json
{
  "status": {
    "in_review": "In review",
    "onboarded": "Onboarded",
    "declined": "Declined",
    "in_progress": "In progress"
  },
  "buttons": {
    "submit": "Submit"
  }
}
```