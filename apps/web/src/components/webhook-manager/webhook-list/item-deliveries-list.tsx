import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'
import * as Table from '@repo/ui/components/shadcn/table'

export default function ItemDeliveriesList({
    deliveries,
}: {
    deliveries: RestEndpointMethodTypes['repos']['listWebhookDeliveries']['response']['data']
}) {
    return (
        <Table.Table>
            <Table.TableHead>
                <Table.TableRow>
                    <Table.TableHeader>Event</Table.TableHeader>
                    <Table.TableHeader>Delivery</Table.TableHeader>
                    <Table.TableHeader>Status</Table.TableHeader>
                </Table.TableRow>
            </Table.TableHead>
            <Table.TableBody>
                {deliveries.map((delivery) => (
                    <Table.TableRow key={delivery.id}>
                        <Table.TableCell>{delivery.event}</Table.TableCell>
                        <Table.TableCell>{delivery.id}</Table.TableCell>
                        <Table.TableCell>{delivery.status}</Table.TableCell>
                    </Table.TableRow>
                ))}
            </Table.TableBody>
        </Table.Table>
    )
}
