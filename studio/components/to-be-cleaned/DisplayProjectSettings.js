import useSWR from 'swr'
import { useRouter } from 'next/router'
import { get } from 'lib/common/fetch'
import { IconAlertCircle, Input, Loading, Typography } from '@supabase/ui'

import { API_URL } from 'lib/constants'
import Panel from './Panel'

const { Text, Title } = Typography

export function DisplayApiSettings() {
  const router = useRouter()
  const { ref } = router.query

  const { data, error } = useSWR(`${API_URL}/props/project/${ref}/settings`, get)

  if (!data)
    return (
      <ApiContentWrapper>
        <Panel.Content className="py-8">
          {error ? (
            <div className="flex items-center space-x-2">
              <Typography.Text type="secondary">
                <IconAlertCircle strokeWidth={2} />
              </Typography.Text>
              <Typography.Text type="secondary">Failed to fetch API keys</Typography.Text>
            </div>
          ) : (
            <div className="py-4">
              <Loading active={true} />
            </div>
          )}
        </Panel.Content>
      </ApiContentWrapper>
    )

  const { services } = data

  // Get the API service
  const API_SERVICE_ID = 1
  let apiService = services.find((x) => x.app.id == API_SERVICE_ID)
  let apiKeys = apiService.service_api_keys

  return (
    <ApiContentWrapper>
      {!data ? (
        <Loading active={true} />
      ) : (
        apiKeys.map((x, i) => (
          <Panel.Content
            key={x.api_key}
            className={
              i >= 1 &&
              'border-t border-panel-border-interior-light dark:border-panel-border-interior-dark'
            }
          >
            <Input
              layout="horizontal"
              label={
                <>
                  {x.tags?.split(',').map((x, i) => (
                    <code key={`${x}${i}`} className="text-xs bg-gray-500 text-white px-2">
                      {x}
                    </code>
                  ))}
                  {x.tags === 'service_role' && (
                    <code className="text-xs bg-red-500 px-2 ml-1 text-white">{'secret'}</code>
                  )}
                  {x.tags === 'anon' && (
                    <code className="text-xs bg-gray-500 text-white px-2 ml-1">{'public'}</code>
                  )}
                </>
              }
              readOnly
              copy
              className="input-mono"
              disabled
              reveal={x.tags !== 'anon' && true}
              value={x.api_key}
              onChange={() => {}}
              descriptionText={
                x.tags === 'service_role'
                  ? 'This key has the ability to bypass Row Level Security. Never share it publicly.'
                  : 'This key is safe to use in a browser if you have enabled Row Level Security for your tables and configured policies.'
              }
            />
          </Panel.Content>
        ))
      )}
    </ApiContentWrapper>
  )
}

export function DisplayConfigSettings() {
  const router = useRouter()
  const { ref } = router.query

  const { data, error } = useSWR(`${API_URL}/props/project/${ref}/settings`, get)

  if (!data)
    return (
      <ConfigContentWrapper>
        <Panel.Content className="py-8">
          {error ? (
            <div className="flex items-center space-x-2">
              <Typography.Text type="secondary">
                <IconAlertCircle strokeWidth={2} />
              </Typography.Text>
              <Typography.Text type="secondary">
                Failed to fetch project configuration
              </Typography.Text>
            </div>
          ) : (
            <div className="py-4">
              <Loading active={true} />
            </div>
          )}
        </Panel.Content>
      </ConfigContentWrapper>
    )

  const { project, services } = data

  // Get the API service
  const API_SERVICE_ID = 1
  let jwtSecret = project.jwt_secret ?? ''
  let apiService = services.find((x) => x.app.id == API_SERVICE_ID)
  let apiConfig = apiService.app_config

  return (
    <section>
      <Panel
        title={
          <Typography.Title level={6} className="mb-0">
            Project Configuration
          </Typography.Title>
        }
      >
        <Panel.Content>
          <Input
            label="URL"
            readOnly
            copy
            readOnly
            disabled
            copy
            className="input-mono"
            value={`https://${apiConfig.endpoint}`}
            descriptionText="A RESTful endpoint for querying and managing your database."
            layout="horizontal"
          />
        </Panel.Content>
        <Panel.Content className="border-t border-panel-border-interior-light dark:border-panel-border-interior-dark">
          <Input
            label="JWT Secret"
            readOnly
            copy
            reveal
            disabled={true}
            value={jwtSecret}
            className="input-mono"
            descriptionText="Used to decode your JWTs. You can also use this to mint your own JWTs."
            layout="horizontal"
          />
        </Panel.Content>
      </Panel>
    </section>
  )
}

const ApiContentWrapper = ({ children }) => {
  return (
    <Panel
      title={
        <div className="space-y-3">
          <Title level={5}>Project API keys</Title>
          <Text className="block" type="secondary">
            Your API is secured behind an API gateway which requires an API Key for every request.
            <br />
            You can use the keys below to use Supabase client libraries.
          </Text>
        </div>
      }
    >
      {children}
    </Panel>
  )
}

const ConfigContentWrapper = ({ children }) => {
  return (
    <Panel
      title={
        <div className="space-y-3">
          <Title level={5}>Project Configuration</Title>
        </div>
      }
    >
      {children}
    </Panel>
  )
}
