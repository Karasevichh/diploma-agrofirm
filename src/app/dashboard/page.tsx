import DashboardClient from '../../components/DashboardClient';
import MapComponent from '@/components/MapComponent';

export default function DashboardPage() {
    return (
        <div>
            <DashboardClient />
            <h2>Карта полей</h2>
            <MapComponent/>
        </div>

    );
}
