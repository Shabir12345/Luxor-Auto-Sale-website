# Quick Check: Vercel Environment Variables

## Make sure ONLY these R2 variables are set:

```
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=[REDACTED]
R2_SECRET_ACCESS_KEY=your-secret-key (should be ~40 chars)
R2_BUCKET=luxor-auto-sale-images
```

## Make sure these AWS variables are NOT set (or are empty):

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

If AWS variables are set, they might be overriding R2 variables!

